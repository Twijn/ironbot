const {Guild, TextChannel} = require("discord.js");

const config = require("../config.json");

const CacheManager = require("./cache/CacheManager");
const EnvoyListenerManager = require("./EnvoyListenerManager");
const MapManager = require("./MapManager");

const Schemas = require("./schemas/");

const Discord = require("./discord/");
const Twitch = require("./twitch/");

const ONE_SECOND = 1;
const ONE_MINUTE = ONE_SECOND * 60;
const ONE_HOUR = ONE_MINUTE * 60;
const ONE_DAY = ONE_HOUR * 24;
const ONE_WEEK = ONE_DAY * 7;

class Utils {

    /**
     * Stores all cached information for IronBot
     * @type {CacheManager}
     */
    CacheManager = CacheManager;

    /**
     * Manager for envoy listeners
     * @type {EnvoyListenerManager}
     */
    EnvoyListenerManager = EnvoyListenerManager;

    /**
     * Stores all mongoose schemas
     * @type {Schemas}
     */
    Schemas = Schemas;

    MapManager = new MapManager(this);

    /**
     * Contains Discord-related methods
     * @type {Discord}
     */
    Discord = Discord;

    /**
     * Contains Twitch-related methods
     * @type {Twitch}
     */
    Twitch = Twitch;

    /**
     * The Illumindal Guild
     * @type {Guild}
     */
    guild;

    /**
     * Caches active Community Servers
     * @type {any[]}
     */
    servers = [];

    /**
     * Cache for the servers a member is in
     */
    memberServers = {};

    /**
     * Storage for frequently used channels
     * @type {{locationRequest:TextChannel,events:TextChannel,applications:TextChannel}}
     */
    channels = {
        locationRequest: null,
        events: null,
        applications: null,
    };

    constructor() {
        setTimeout(() => {
            global.discord.guilds.fetch(config.discord.guild).then(async guild => {
                this.guild = guild;
                console.log(`Using guild "${guild.name}" (${guild.id}) as The Illumindal Guild`)

                for (const channelName in config.discord.channels) {
                    try {
                        const channel = await guild.channels.fetch(config.discord.channels[channelName]);
                        this.channels[channelName] = channel;
                        console.log(`Using "${channel.name}" for ${channelName}`)
                    } catch(err) {
                        console.error(`Failed to get ${channelName}`);
                        console.error(err);
                    }
                }

                this.servers = await this.Schemas.Server.find({}).sort({name: 1}).populate(["host","operator"]);

                console.log(`Loaded ${this.servers.length} community server(s): ${this.servers.map(x => x.name).join(", ")}`);
            }, console.error);
        }, 250);
    }

    /**
     * Converts a number into a string with commas
     * Example: 130456 -> 130,456
     * @param {number} num 
     * @returns {string}
     */
    comma(num) {
        if (!num) return "0";
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    /**
     * Generates a random string of (length) length.
     * @param {number} length 
     * @returns {string} Generated String
     */
    stringGenerator(length = 32) {
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let str = '';
        for (let i = 0; i < length; i++) {
            str += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return str;
    }

    /**
     * Returns a relative time string from a second value.
     * @param seconds
     * @param iterations How many iterations? For example 2 = 'x hours y minutes'
     * @returns {string}
     */
    relativeTime(seconds, iterations = 2) {
        let result = "";
        if (seconds >= ONE_WEEK) {
            const num = Math.floor(seconds / ONE_WEEK);
            result += `${num} week${num === 1 ? "" : "s"}`;
            seconds -= num * ONE_WEEK;
        } else if (seconds >= ONE_DAY) {
            const num = Math.floor(seconds / ONE_DAY);
            result += `${num} day${num === 1 ? "" : "s"}`;
            seconds -= num * ONE_DAY;
        } else if (seconds >= ONE_HOUR) {
            const num = Math.floor(seconds / ONE_HOUR);
            result += `${num} hour${num === 1 ? "" : "s"}`;
            seconds -= num * ONE_HOUR;
        } else if (seconds >= ONE_MINUTE) {
            const num = Math.floor(seconds / ONE_MINUTE);
            result += `${num} minute${num === 1 ? "" : "s"}`;
            seconds -= num * ONE_MINUTE;
        } else {
            const num = Math.floor(seconds / ONE_SECOND);
            result += `${num} second${num === 1 ? "" : "s"}`;
            seconds = 0;
        }

        if (seconds > 0 && iterations > 1) {
            result += " " + this.relativeTime(seconds, iterations - 1);
        }

        return result.trim();
    }

    /**
     * Dumps the cache for a member's servers
     * @param {any} identity
     */
    dumpMemberServers(identity) {
        delete this.memberServers[String(identity._id)];
    }
    
}

const utils = new Utils();
global.utils = utils;
module.exports = utils;
