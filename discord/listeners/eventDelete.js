const { Events, GuildScheduledEvent } = require("discord.js");

const utils = require("../../utils/");

const listener = {
    name: "eventDelete",
    event: Events.GuildScheduledEventDelete,
    /**
     * Executor for this listener
     * @param {GuildScheduledEvent} event 
     */
    execute: async event => {
        utils.Schemas.Event.findByIdAndUpdate(event.id, {
            cancelled: true,
        });

        const discordMessages = await utils.Schemas.DiscordMessage.find({event: event.id});
        for (let i = 0; i < discordMessages.length; i++) {
            const message = discordMessages[i];
            event.client.channels.fetch(message.channel).then(channel => {
                channel.messages.fetch(message._id).then(message => {
                    message.delete().catch(console.error);
                }, console.error);
            }).catch(console.error);
            await message.deleteOne();
        }
    }
}

module.exports = listener;
