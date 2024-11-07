const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ModalBuilder, ActionRowBuilder,
    TextInputBuilder, TextInputStyle
} = require("discord.js");

const utils = require("../../utils/");

const command = {
    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("Commands related to user profiles")
        .addSubcommand(s => s
                .setName("edit")
                .setDescription("Edits your user profile")
        ),
    cache: {},
    /**
     * Executor for this chat command
     * @param {ChatInputCommandInteraction} interaction
     */
    execute: async interaction => {
        const command = interaction.options.getSubcommand(true);
        if (command === "edit") {
            const discordUser = await utils.Discord.getUserById(interaction.member.id);
            const identity = await discordUser.createIdentity();

            const modal = new ModalBuilder()
                .setCustomId("profile-edit")
                .setTitle("Edit your Profile")
                .setComponents(
                    new ActionRowBuilder()
                        .setComponents(
                            new TextInputBuilder()
                                .setCustomId("biography")
                                .setLabel("Biography")
                                .setPlaceholder("Write something about yourself!")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                                .setMaxLength(100)
                                .setValue(identity?.biography ? identity.biography : "")
                        ),
                    new ActionRowBuilder()
                        .setComponents(
                            new TextInputBuilder()
                                .setCustomId("steam-code")
                                .setLabel("Steam Friend Code")
                                .setPlaceholder("000000000")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                                .setMaxLength(10)
                                .setValue(identity?.friendCodes?.steam ? identity.friendCodes.steam : "")
                        ),
                    new ActionRowBuilder()
                        .setComponents(
                            new TextInputBuilder()
                                .setCustomId("switch-code")
                                .setLabel("Switch Friend Code")
                                .setPlaceholder("SW-0000-0000-0000")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                                .setMaxLength(17)
                                .setValue(identity?.friendCodes?.switch ? identity.friendCodes.switch : "")
                        )
                );
            interaction.showModal(modal).catch(console.error);
        } else {
            interaction.error("Invalid subcommand!");
        }
    }
}

module.exports = command;
