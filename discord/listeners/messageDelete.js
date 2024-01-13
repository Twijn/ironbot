const { Events, Message } = require("discord.js");

const utils = require("../../utils/");

const listener = {
    name: "messageDelete",
    event: Events.MessageDelete,
    /**
     * Executor for this listener
     * @param {Message} message 
     */
    execute: async message => {
        utils.Schemas.DiscordMessage.findByIdAndDelete(message.id).catch(console.error);
    }
}

module.exports = listener;
