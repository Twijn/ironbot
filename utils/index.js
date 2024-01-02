const {Guild} = require("discord.js");

const config = require("../config.json");

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

    /**
     * The Adventurers Guild
     * @type {Guild}
     */
    guild;

    constructor() {
        setTimeout(() => {
            global.discord.guilds.fetch(config.discord.guild).then(guild => {
                this.guild = guild;
                console.log(`Using guild "${guild.name}" (${guild.id}) as The Adventurers Guild`)
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
    
}

const utils = new Utils();
global.utils = utils;
module.exports = utils;
