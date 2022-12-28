const { SlashCommandBuilder } = require("discord.js");

const command = {
    data: new SlashCommandBuilder()
        .setName("connect")
        .setDescription("Connect your Discord account to Twitch & IronBot"),
    execute: async interaction => {
        interaction.success("Hello world!");
    }
}

module.exports = command;