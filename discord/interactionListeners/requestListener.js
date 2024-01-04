const {  ButtonInteraction } = require("discord.js");

const listener = {
    name: "requestListener",
    verify: interaction => interaction.isButton() && interaction.customId === "complete-request",
    /**
     * Executor for this listener
     * @param {ButtonInteraction} interaction 
     */
    execute: async interaction => {
        interaction.message.delete().then(() => {
            interaction.success("Request completed!");
        }, err => {
            console.error(err);
            interaction.error("Unable to delete the message! Try again.");
        });
    }
}

module.exports = listener;
