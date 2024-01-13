const { SlashCommandBuilder, ChatInputCommandInteraction, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const config = require("../../config.json");

const command = {
    data: new SlashCommandBuilder()
        .setName("application")
        .setDescription("Create and manage your applications")
        .addSubcommand(subcommand => 
            subcommand
                .setName("new")
                .setDescription("Create a new application")
                .addStringOption(opt => 
                    opt
                        .setName("server-1")
                        .setDescription("The first server to apply to")
                        .setAutocomplete(true)
                        .setRequired(true)
                )
                .addStringOption(opt => 
                    opt
                        .setName("server-2")
                        .setDescription("The second server to apply to")
                        .setAutocomplete(true)
                )
                .addStringOption(opt => 
                    opt
                        .setName("server-3")
                        .setDescription("The third server to apply to")
                        .setAutocomplete(true)
                )
                .addStringOption(opt => 
                    opt
                        .setName("server-4")
                        .setDescription("The fourth server to apply to")
                        .setAutocomplete(true)
                )
                .addStringOption(opt => 
                    opt
                        .setName("server-5")
                        .setDescription("The fifth server to apply to")
                        .setAutocomplete(true)
                )
        )
        .setDMPermission(false),
    /**
     * Executor for this chat command
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute: async interaction => {
        
    }
}

module.exports = command;
