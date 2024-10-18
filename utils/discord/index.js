const {discord} = require("../cache/CacheManager");

const Authentication = require("./Authentication");
const DiscordUser = require("../schemas/DiscordUser");

const config = require("../../config.json");

class Discord {

    /**
     * Authentication methods for Discord
     * @type {Authentication}
     */
    Authentication = new Authentication();

    /**
     * The Illumindal Guild guild
     */
    guild = null;

    /**
     * Force retrieves a user
     * @param {string} id
     */
    #getUserByIdByForce(id) {
        return new Promise((resolve, reject) => {
            global.discord.users.fetch(id).then(user => {
                DiscordUser.findByIdAndUpdate(user.id, {
                    _id: user.id,
                    username: user.username,
                    // displayName: user.displayName, currently nonfunctional
                    discriminator: user.discriminator,
                    accentColor: user.hexAccentColor,
                    avatar: user.avatar,
                    bot: user.bot,
                }, {
                    upsert: true,
                    new: true,
                }).then(resolve, err => {
                    console.error(err);
                    reject("User not found!");
                });
            }, err => {
                console.error(err);
                reject("User not found!");
            });
        });
    }

    /**
     * Gets a user by ID
     * @param {string} id 
     * @param {boolean} bypassCache 
     * @param {boolean} requestIfUnavailable 
     */
    getUserById(id, bypassCache = false, requestIfUnavailable = false) {
        return discord.get(id, async (resolve, reject) => {
            const user = await DiscordUser.findById(id)
                .populate("identity");

            if (user) {
                resolve(user);
            } else {
                if (requestIfUnavailable) {
                    this.#getUserByIdByForce(id).then(resolve, reject);
                } else {
                    reject("User not found!");
                }
            }
        }, bypassCache);
    }

    /**
     * Generates an OAuth2 link for Discord
     * @returns {string}
     */
    generateOAuthLink(state) {
        return `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(config.discord.clientId)}&response_type=code&redirect_uri=${encodeURIComponent(config.web.host + "auth/discord")}&scope=identify+guilds.join+guilds${state ? `&state=${encodeURIComponent(state)}` : ""}`;
    }

    constructor() {
        setTimeout(() => {
            global.discord.guilds.fetch(config.discord.guild).then(guild => {
                this.guild = guild;
            }, console.error);
        }, 100);
    }

}

module.exports = new Discord();
