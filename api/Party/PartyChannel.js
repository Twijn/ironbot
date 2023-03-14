const { TextChannel, VoiceChannel } = require("discord.js");

class PartyChannel {

    /**
     * The text/voice channel
     * @type {TextChannel|VoiceChannel}
     */
    channel;

    /**
     * The channel type
     * @type {"mod"|"user"}
     */
    type;

    /**
     * Constructor for a PartyChannel
     * @param {TextChannel|VoiceChannel} channel 
     * @param {"mod"|"user"} type 
     */
    constructor(channel, type) {
        this.channel = channel;
        this.type = type;
    }

}

module.exports = PartyChannel;