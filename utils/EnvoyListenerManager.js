const mongoose = require("mongoose");
const { TextChannel } = require("discord.js");

const EnvoyListener = require("./schemas/EnvoyListener");

class EnvoyListenerManager {

    /**
     * Stores all listeners
     * @type {{_id:any,twitchUser:any,channel:TextChannel,roleMention:string}[]}
     */
    listeners = [];

    /**
     * Stores the Discord text channel
     */
    channels = {};

    constructor() {
        EnvoyListener.find({}).populate(["twitchUser","discordUser"]).then(listeners => {
            this.listeners = listeners;
            setTimeout(async () => {
                for (let i = 0; i < listeners.length; i++) {
                    const channelId = listeners[i].discordChannel;
                    if (!this.channels.hasOwnProperty(channelId)) {
                        this.channels[channelId] = await global.discord.channels.fetch(channelId);
                    }
                }
            }, 1000);
        }, console.error);
    }

    /**
     * Creates a new listener
     * @param {{_id:string}} twitchUser
     * @param {{_id:string}} discordUser
     * @param {TextChannel} channel
     * @param {string} roleMention
     * @returns {Promise<{_id:string}>}
     */
    createListener(twitchUser, discordUser, channel, roleMention = "") {
        return new Promise((resolve, reject) => {
            if (this.listeners.find(x => x.discordChannel === channel.id && x.twitchUser._id === twitchUser._id)) {
                return reject("A listener with this channel and user already exists!");
            }

            EnvoyListener.create({
                twitchUser,
                discordUser,
                discordChannel: channel.id,
                roleMention,
            }).then(listener => {
                resolve(listener);
                this.listeners.push(listener);
                this.channels[channel.id] = channel;
            }, err => {
                console.error(err);
                reject("An error occurred!");
            });
        });
    }

    /**
     * Removes an active listener
     * @param {string} id 
     * @returns {Promise<void>}
     */
    removeListener(id) {
        return new Promise((resolve, reject) => {
            try {
                id = new mongoose.Types.ObjectId(id);
            } catch(err) {
                return reject("Invalid listener ID");
            }
            EnvoyListener.findByIdAndDelete(id).then(() => {
                this.listeners = this.listeners.filter(x => String(x._id) !== String(id));
                resolve();
            }, reject);
        });
    }

    /**
     * Retrieves all of the listeners
     * @returns {{_id:any,twitchUser:any,discordUser:any,discordChannel:any,roleMention:string}[]}
     */
    getAllListeners() {
        return this.listeners;
    }

    /**
     * Retrieves a Discord channel by its ID
     * @param {string} id 
     * @returns {TextChannel}
     */
    getDiscordChannel(id) {
        return this.channels[id];
    }

}

module.exports = new EnvoyListenerManager();
