const NodeGeocoder = require("node-geocoder");
const geolib = require("geolib");

const LOOKUP_RATE_LIMIT_TIME = 60 * 1000; // 1 minute
const LOOKUP_RATE_LIMIT = 5; // LOOKUP_RATE_LIMIT requests per LOOKUP_RATE_LIMIT_TIME

const SAVE_RATE_LIMIT_TIME = 60 * 60 * 1000; // 1 hour
const SAVE_RATE_LIMIT = 2; // SAVE_RATE_LIMIT requests per LOOKUP_RATE_LIMIT_TIME

const config = require("../config.json");
const utils = require("./index");

const geocoder = NodeGeocoder({
    provider: "google",
    apiKey: config.google.apiKey,
})

/**
 *
 * @type {{type: "lookup"|"save",identity: string, time: number}[]}
 */
let requests = [];

const getFormattedAddress = result => {
    return `${result.city}${result?.administrativeLevels?.level1short ? `, ${result.administrativeLevels.level1short} ` : " "}${result.countryCode}`;
}

/**
 * Checks rate limit for an identity
 * @param type {"lookup"|"save"}
 * @param identity {string}
 * @param limit {number}
 * @param timeLimit {number}
 * @returns {used: number, remaining: number, reset: number}
 */
const checkRateLimit = (type, identity, limit, timeLimit) => {
    requests = requests.filter(x => x.type !== type || x.time > Date.now() - timeLimit);

    let previousRequests = requests.filter(x => x.type === type && x.identity === identity);

    const reset = (previousRequests.length > 0 ? previousRequests[0].time : Date.now()) + timeLimit;

    if (previousRequests.length < limit) {
        requests.push({
            type, identity,
            time: Date.now(),
        });
    }

    return {
        used: previousRequests.length,
        remaining: limit - previousRequests.length,
        reset,
    };
}

const formatResult = result => {
    return {
        formattedAddress: result.formattedAddress,
        latlng: {
            latitude: result.latitude,
            longitude: result.longitude,
        },
    };
}

const pointToString = point => {
    return `[${point.latitude},${point.longitude}]`;
}

const checkDistance = (pointOne, pointTwo) => {
    const distanceInMeters = geolib.getDistance({
        latitude: pointOne.latitude,
        longitude: pointOne.longitude,
    }, {
        latitude: pointTwo.latitude,
        longitude: pointTwo.longitude,
    });

    const distanceInMiles = geolib.convertDistance(distanceInMeters, "mi");

    console.log(`[Map] Distance between ${pointToString(pointOne)} - ${pointToString(pointTwo)}: ${distanceInMiles} mile(s)`);

    return distanceInMiles;
}

class MapManager {

    /**
     * Stores the map cache
     * @type {{identity:string,location:{name:string,latlng:[number,number],discordUsers:{id:string,username:string,identity:string,}[]}}[]}
     */
    #cache = [];

    findLocationFromQuery(query, identityId) {
        return new Promise((resolve, reject) => {
            identityId = String(identityId);
            const {remaining, reset} = checkRateLimit("lookup", identityId, LOOKUP_RATE_LIMIT, LOOKUP_RATE_LIMIT_TIME);

            if (remaining <= 0) {
                reject(`Rate limit reached! Try again in ${Math.floor((reset - Date.now()) / 1000)} second(s).`);
            }

            console.log(`[Map] Looking up '${query}' for ${identityId}`);

            geocoder.geocode(query).then(result => {
                if (result.length > 0) {
                    console.log(`[Map] Found ${result.length} result(s)`);
                    if (result[0].hasOwnProperty("streetNumber") || result[0].hasOwnProperty("streetName")) {
                        console.log(`[Map] Address too specific. Narrowing...`);
                        geocoder.geocode(getFormattedAddress(result[0])).then(result2 => {
                            if (result2.length > 0) {
                                const data = formatResult(result2[0]);
                                console.log("[Map] Narrowed down search to " + data.formattedAddress);
                                resolve(data);
                            } else {
                                console.log("[Map] No narrowed searches found");
                                reject("No results were found!");
                            }
                        }, err => {
                            console.error(err);
                            reject("An unknown error occurred!");
                        });
                    } else {
                        const data = formatResult(result[0]);
                        console.log("[Map] Found " + data.formattedAddress);
                        resolve(data);
                    }
                } else {
                    console.log("[Map] No results were found!");
                    reject("No results were found!");
                }
            }, err => {
                console.error(err);
                reject("An unknown error occurred!");
            });
        });
    }

    saveLocation(lat, lng, name, identityId) {
        return new Promise((resolve, reject) => {
            identityId = String(identityId);
            const {remaining, reset} = checkRateLimit("save", String(identityId), SAVE_RATE_LIMIT, SAVE_RATE_LIMIT_TIME);

            if (remaining <= 0) {
                console.log("[Map] Rate limit reached");
                reject(`Rate limit reached! Try again in ${Math.floor((reset - Date.now()) / 1000)} second(s).`);
            }

            geocoder.geocode(name).then(result => {
                if (result.length > 0) {
                    const distance = checkDistance({
                        latitude: result[0].latitude,
                        longitude: result[0].longitude,
                    }, {
                        latitude: lat,
                        longitude: lng,
                    });

                    if (distance < 10) {
                        this.utils.Schemas.Identity.findByIdAndUpdate(identityId, {
                            $set: {
                                'map.name': name,
                                'map.latlng': [lat, lng],
                                'map.country': result[0].country,
                                'map.countryCode': result[0].countryCode,
                            },
                        }).then(() => {
                            console.log("[Map] User updated");
                            resolve({
                                latitude: lat, longitude: lng, distance, name,
                            });
                            this.utils.CacheManager.removeIdentity(identityId);
                            this.update().catch(console.error);
                        }, err => {
                            console.error(err);
                            reject("An unknown error occurred!");
                        });
                    } else {
                        console.log(`[Map] Distance too long: ${distance.toFixed(1)}`);
                        reject(`[Map] Distance between latitude/longitude and resolved location too far: ${distance.toFixed(1)} mile(s)`);
                    }
                } else {
                    console.log("[Map] No results found when looking up location name");
                    reject("No lookup results found under " + name + "!");
                }
            }, err => {
                console.error(err);
                reject("An unknown error occurred!");
            });
        });
    }

    deleteLocation(identityId) {
        return new Promise((resolve, reject) => {
            this.utils.Schemas.Identity.findByIdAndUpdate(identityId, {
                $unset: {
                    map: 1,
                }
            }).then(() => {
                resolve();
                this.utils.CacheManager.removeIdentity(identityId);
                this.update().catch(console.error);
            }, err => {
                console.error(err);
                reject("An unknown error occurred!");
            });
        });
    }

    async update() {
        console.log("[MapManager] Updating map");
        const start = Date.now();

        const identities = await this.utils.Schemas.Identity.find({"map.latlng": {$ne: null}, "map.name": {$ne: null}});

        let result = [];

        for (let i = 0; i < identities.length; i++) {
            const identity = identities[i];
            result.push({
                identity: String(identity._id),
                location: identity.map,
                discordUsers: (await identity.getDiscordUsers()).map(x => x.public()),
            });
        }

        this.#cache = result;

        console.log(`[MapManager] Updated map in ${Math.floor(Date.now() - start)} ms`);
    }

    get() {
        return this.#cache;
    }

    constructor(utils) {
        this.utils = utils;
        this.update().catch(console.log);
    }
}

module.exports = MapManager;
