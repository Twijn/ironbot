const {  AutocompleteInteraction  } = require("discord.js");
const con = require("../../database");

let partiesCache = null;

const listener = {
    name: "partyAutocomplete",
    verify: interaction => interaction.isAutocomplete() && (
        interaction.commandName === "party" ||
        interaction.commandName === "partyadmin"
    ),
    /**
     * Executor for this listener
     * @param {AutocompleteInteraction} interaction 
     */
    execute: async interaction => {
        if (!interaction.inGuild()) {
            interaction.error("This must be ran in The Adventures Guild!");
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        const focused = interaction.options.getFocused(true);

        if (focused && focused.name === "party") {
            if (!partiesCache) {
                partiesCache = await con.pquery("select * from party;")
                setTimeout(() => {
                    partiesCache = null;
                }, 10000);
            }

            let parties = partiesCache;

            if (subcommand === "accept" || subcommand === "deny") {
                parties = parties.filter(x => !x.active);
            }

            parties = parties.filter(x => x.name.toLowerCase().startsWith(focused.value.toLowerCase()));

            parties = parties.map(x => {
                return {
                    name: x.name,
                    value: String(x.id),
                };
            })

            interaction.respond(parties);
        }
    }
}

module.exports = listener;