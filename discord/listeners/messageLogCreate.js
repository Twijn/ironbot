const { Events, Message } = require("discord.js");

const utils = require("../../utils/");
const config = require("../../config.json");

const listener = {
    name: "messageLogCreate",
    event: Events.MessageCreate,
    /**
     * Executor for this listener
     * @param {Message} message
     */
    execute: async message => {
        if (!message.inGuild() || message.author.id === config.discord.clientId) {
            return;
        }

        try {
            const discordUser = await utils.Discord.getUserById(message.author.id);
            const identity = await discordUser.createIdentity();

            await utils.Schemas.DiscordMessage.findByIdAndUpdate(message.id, {
                _id: message.id,
                identity: identity._id,
                channel: message.channelId,
                contentLength: message.content.length,
                hasAttachments: message.attachments.size > 0,
            }, {
                upsert: true,
                new: true,
            });
        } catch(err) {
            console.error(err);
        }
    }
}

module.exports = listener;
