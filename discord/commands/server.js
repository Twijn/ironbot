const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");

const utils = require("../../utils/");

const command = {
    data: new SlashCommandBuilder()
        .setName("server")
        .setDescription("View active community servers from The Illumindal Guild")
        .addStringOption(opt => 
            opt
                .setName("server")
                .setDescription("The server to view")
                .setAutocomplete(true)
                .setRequired(true)
        )
        .setDMPermission(false),
    /**
     * Executor for this chat command
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute: async interaction => {
        const serverId = interaction.options.getString("server", true);
        const server = utils.servers.find(x => String(x._id) === serverId);
        
        if (!server) {
            return interaction.error("Unable to find the server with that ID!");
        }

        interaction.reply({embeds: [server.createEmbed()], ephemeral: true});
    }
}

module.exports = command;