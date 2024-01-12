const { ButtonInteraction } = require("discord.js");

const utils = require("../../utils/");

const listener = {
    name: "applicationListener",
    /**
     * Verifier for the listener
     * @param {ButtonInteraction} interaction 
     */
    verify: interaction => interaction.isButton() && (interaction.customId.startsWith("acceptapp-") || interaction.customId.startsWith("denyapp-")),
    /**
     * Executor for this listener
     * @param {ButtonInteraction} interaction 
     */
    execute: async interaction => {
        const [type, id] = interaction.customId.split("-");

        let application;
        
        try {
            application = await utils.Schemas.Application.findById(id)
                .populate(["server","identity","discordUser","steamUser","twitchUser"]);
        } catch(err) {}

        if (!application) {
            return interaction.error(`Unable to retrieve the application \`${id}\`!`);
        }

        if (interaction.user.id !== application.server.host && interaction.user.id !== application.server.operator) {
            return interaction.error("You must be the server host or operator to manage this application!");
        }

        if (type === "acceptapp") {
            application.accept().then(() => {
                interaction.success("Succesfully approved application!");
            }, err => {
                console.error(err);
                interaction.error(String(err));
            })
        } else if (type === "denyapp") {

        } else {
            interaction.error(`Unknown action type \`${type}\``);
        }
    }
}

module.exports = listener;
