const { Message } = require("discord.js");

class PartyMessage {

    /**
     * The party message
     * @type {Message}
     */
    message;

    /**
     * The message type
     * @type {"suggest"|"announce"}
     */
    type;

    /**
     * Constructor for a PartyMessage
     * @param {Message} message 
     * @param {"suggest"|"announce"} type 
     */
    constructor(message, type) {
        this.message = message;
        this.type = type;
    }

}

module.exports = PartyMessage;