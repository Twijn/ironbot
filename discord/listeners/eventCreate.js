const { Events, GuildScheduledEvent } = require("discord.js");

const utils = require("../../utils/");

const listener = {
    name: "eventCreate",
    event: Events.GuildScheduledEventCreate,
    /**
     * Executor for this listener
     * @param {GuildScheduledEvent} event 
     */
    execute: async event => {
        try {
            const creator = await utils.Discord.getUserById(event.creatorId, false, true);

            const dbEvent = await utils.Schemas.Event.create({
                _id: event.id,
                channel: event.channelId,
                creator,
                name: event.name,
                description: event.description,
                url: event.url,
                startTime: event.scheduledStartAt,
                endTime: event.scheduledEndAt,
                coverUrl: event.coverImageURL(),
            });

            utils.channels.events.send({content: dbEvent.getMentions() + " " + event.url}).then(message => {
                utils.Schemas.DiscordMessage.create({
                    _id: message.id,
                    channel: message.channelId,
                    event: dbEvent,
                });
            }, console.error);
        } catch(err) {
            console.error(err);
        }
    }
}

module.exports = listener;
