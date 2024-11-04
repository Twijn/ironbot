const mongoose = require("mongoose");

const Cache = require("./Cache");

const ONE_HOUR = 60 * 60 * 1000;

class CacheManager {

    discord = new Cache(8 * ONE_HOUR);

    twitch = new Cache(8 * ONE_HOUR);

    session = new Cache(8 * ONE_HOUR);

    /**
     * Removes an identity from all caches
     * @param identity {string|mongoose.Types.ObjectId}
     */
    removeIdentity(identity) {
        identity = String(identity);
        for (const [id, val] of Object.entries(this.discord.objectStore)) {
            if (String(val?.identity?._id ? val.identity._id : val.identity) === identity) {
                this.discord.remove(id);
                console.log("[CacheManager] Removed discord user " + id);
            }
        }
        for (const [id, val] of Object.entries(this.twitch.objectStore)) {
            if (String(val?.identity?._id ? val.identity._id : val.identity) === identity) {
                this.twitch.remove(id);
                console.log("[CacheManager] Removed twitch user " + id);
            }
        }
        for (const [id, val] of Object.entries(this.session.objectStore)) {
            if (String(val?.session?.identity?._id ? val?.session.identity._id : val?.session.identity) === identity) {
                this.session.remove(id);
                console.log("[CacheManager] Removed session " + id.substring(0, 10));
            }
        }
        console.log(`[CacheManager] Removed all identities for identity ${identity}`);
    }

}

module.exports = new CacheManager();
