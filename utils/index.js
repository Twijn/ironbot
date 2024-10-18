const {Guild, TextChannel} = require("discord.js");

const config = require("../config.json");

const CacheManager = require("./cache/CacheManager");

const Schemas = require("./schemas/");

const Discord = require("./discord/");
const Twitch = require("./twitch/");

const EnvoyListenerManager = require("./EnvoyListenerManager");

class Utils {

    /**
     * Stores all cached information for IronBot
     * @type {CacheManager}
     */
    CacheManager = CacheManager;

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
