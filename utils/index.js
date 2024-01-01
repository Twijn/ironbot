const Schemas = require("./schemas/");

const Discord = require("./discord/");
const Twitch = require("./twitch/");

const EnvoyListenerManager = require("./EnvoyListenerManager");

class Utils {

    /**
     * Stores all mongoose schemas
     * @type {Schemas}
     */
    Schemas = Schemas;

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
     * Manager for envoy listeners
     * @type {EnvoyListenerManager}
     */
    EnvoyListenerManager = EnvoyListenerManager;
    
}

const utils = new Utils();
global.utils = utils;
module.exports = utils;
