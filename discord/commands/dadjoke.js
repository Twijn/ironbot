const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");

const jokes = require("../../jokes.json");

const command = {
    data: new SlashCommandBuilder()
        .setName("dadjoke")
        .setDescription("Sends a random dad joke to the channel!"),
    /**
     * Executor for this chat command
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute: async interaction => {
        interaction.reply(jokes[Math.floor(Math.random()*jokes.length)])
            .catch(console.error);
    }
}

module.exports = command;