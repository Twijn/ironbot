const Cache = require("../cache/Cache");

const DiscordUser = require("../schemas/DiscordUser");

const config = require("../../config.json");

class Discord {

    /**
     * Discord user cache
     * @type {Cache}
     */
    userCache = new Cache(1 * 60 * 60 * 1000);

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
                console.log(user)
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
        return this.userCache.get(id, async (resolve, reject) => {
            const user = await DiscordUser.findById(id);

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

    constructor() {
        setTimeout(() => {
            global.discord.guilds.fetch(config.discord.guild).then(guild => {
                this.guild = guild;
            }, console.error);
        }, 100);
    }

}

module.exports = new Discord();
