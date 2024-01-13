const { ButtonInteraction, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

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
            const modal = new ModalBuilder()
                .setCustomId(`deny-${application._id}`)
                .setTitle("Set Deny Reason(s)")
                .addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("user")
                                .setLabel("User Reason")
                                .setPlaceholder("This reason is viewable by the user.")
                                .setRequired(true)
                                .setMinLength(3)
                                .setMaxLength(100)
                                .setStyle(TextInputStyle.Short)
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId("operator")
                                .setLabel("Operator Reason")
                                .setPlaceholder("Viewable by operators. Defaults to the user reason")
                                .setRequired(false)
                                .setMinLength(3)
                                .setMaxLength(100)
                                .setStyle(TextInputStyle.Short)
                        )
                );

            interaction.showModal(modal);
            interaction.awaitModalSubmit({
                time: 15 * 60 * 1000,
                filter: interaction => interaction.customId === `deny-${application._id}`,
            }).then(modalInteraction => {
                const userReason = modalInteraction.fields.getTextInputValue("user");
                const operatorReason = modalInteraction.fields.getTextInputValue("operator");

                application.deny(userReason, operatorReason).then(() => {
                    modalInteraction.reply({content: "Successfully denied application!", ephemeral: true});
                }, err => {
                    console.error(err);
                    modalInteraction.reply({content: String(err), ephemeral: true});
                });
            }).catch(console.error);
        } else {
            interaction.error(`Unknown action type \`${type}\``);
        }
    }
}

module.exports = listener;
