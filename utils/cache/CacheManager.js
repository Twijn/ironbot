const Cache = require("./Cache");

const ONE_HOUR = 60 * 60 * 1000;

class CacheManager {

    discord = new Cache(ONE_HOUR);

    twitch = new Cache(ONE_HOUR);

    session = new Cache(8 * ONE_HOUR);

}

module.exports = new CacheManager();
