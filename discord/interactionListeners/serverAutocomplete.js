const { AutocompleteInteraction } = require("discord.js");

const utils = require("../../utils/");

const listener = {
    name: "serverAutocomplete",
    verify: interaction => interaction.isAutocomplete(),
    /**
     * Executor for this listener
     * @param {AutocompleteInteraction} interaction 
     */
    execute: async interaction => {
        const focused = interaction.options.getFocused(true);
        if (focused.name.startsWith("server")) {
            const servers = utils.servers
                .filter(x => focused.value === "" || x.name.toLowerCase().includes(focused.value.toLowerCase()) || x.game.toLowerCase().includes(focused.value.toLowerCase()))
                .map(x => {return {value: String(x._id), name: `${x.name} (${x.game})`}});
            interaction.respond(servers);
        }
    }
}

module.exports = listener;
