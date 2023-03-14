const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandSubcommandBuilder, SlashCommandStringOption, ModalBuilder, ActionRowBuilder, TextInputBuilder } = require("discord.js");
const api = require("../../api");

const command = {
    data: new SlashCommandBuilder()
        .setName("partyadmin")
        .setDescription("Everything party admin-y for the Adventurers Guild!")
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("accept")
                .setDescription("Accept a suggested Party")
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("party")
                        .setDescription("The party to approve")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("deny")
                .setDescription("Deny a suggested Party")
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("party")
                        .setDescription("The party to deny")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    /**
     * Executor for this chat command
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute: async interaction => {
        if (!interaction.inGuild()) {
            interaction.error("This must be ran in The Adventures Guild!");
            return;
        }

        let subcommand = interaction.options.getSubcommand();

        if (subcommand === "accept" || subcommand === "deny") {
            await interaction.deferReply({ephemeral: true});
            try {
                const party = await api.getPartyById(interaction.options.getString("party", true));
                
                if (subcommand === "accept") {
                    party.activate().then(party => {
                        interaction.success("Activated this party!", true);
                    }, err => {
                        console.error(err);
                        interaction.error(String(err), true);
                    });
                } else if (subcommand === "deny") {
                    const modal = new ModalBuilder()
                        .setCustomId("party-deny-" + party.id)
                        .setTitle("Deny Party " + party.name)
                        .setComponents(
                            new ActionRowBuilder()
                                .addComponents(
                                    new TextInputBuilder()
                                        .setCustomId("reason")
                                        .setLabel("Deny Reason")
                                        .setMinLength(10)
                                        .setMaxLength(128)
                                        .setPlaceholder("Example: Party already exists")
                                        .setRequired(true)
                                )
                        );

                    interaction.showModal(modal);
                }
            } catch(err) {
                console.error(err);
                interaction.error(String(err), true);
            }
        }
    }
}

module.exports = command;