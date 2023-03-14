const { SlashCommandBuilder, ChatInputCommandInteraction, SlashCommandSubcommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder } = require("discord.js");

const command = {
    data: new SlashCommandBuilder()
        .setName("party")
        .setDescription("Everything party-ish for the Adventurers Guild!")
        .setDMPermission(false)
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("suggest")
                .setDescription("Suggest a party topic to be created!")
        ),
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

        if (subcommand === "suggest") {
            const modal = new ModalBuilder()
                .setCustomId("party-suggest")
                .setTitle("Suggest a Party")
                .setComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("name")
                                .setLabel("Party Name")
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder("Book Club")
                                .setMinLength(3)
                                .setMaxLength(64)
                                .setRequired(true)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("description")
                                .setLabel("Party Description")
                                .setStyle(TextInputStyle.Paragraph)
                                .setPlaceholder("We talk about all kinds of books! 📚")
                                .setMinLength(16)
                                .setMaxLength(1024)
                                .setRequired(true)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("image-url")
                                .setLabel("Image URL (png/jpeg/webp/gif)")
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder("Show off your group with an image!")
                                .setMinLength(10)
                                .setMaxLength(256)
                                .setRequired(false)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("public")
                                .setLabel("Public Party (true/false)")
                                .setValue("true")
                                .setStyle(TextInputStyle.Short)
                                .setMinLength(4)
                                .setMaxLength(5)
                                .setRequired(true)
                        )
                );

            interaction.showModal(modal);
        }
    }
}

module.exports = command;