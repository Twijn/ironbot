const { AutocompleteInteraction } = require("discord.js");

const utils = require("../../utils/");

const listener = {
    name: "envoyListenerAutocomplete",
    verify: interaction => interaction.isAutocomplete(),
    /**
     * Executor for this listener
     * @param {AutocompleteInteraction} interaction 
     */
    execute: async interaction => {
        const focused = interaction.options.getFocused(true);
        if (focused.name === "listener") {
            const listeners = utils.EnvoyListenerManager.getAllListeners()
                .map(x => {return {value: String(x._id), name: `#${utils.EnvoyListenerManager.getDiscordChannel(x.discordChannel)?.name} Twitch: ${x.twitchUser.display_name} Discord: @${x.discordUser.username}`}});
            interaction.respond(listeners);
        } else {
            interaction.respond([]);
        }
    }
}

module.exports = listener;
