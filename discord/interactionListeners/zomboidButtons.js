const {  ButtonInteraction, ModalBuilder, TextInputComponent, TextInputBuilder, TextInputStyle, codeBlock, EmbedBuilder, ActionRowBuilder  } = require("discord.js");
const config = require("../../config.json");
const con = require("../../database");

const listener = {
    name: "zomboidButtons",
    verify: interaction => interaction.isButton(),
    /**
     * Executor for this listener
     * @param {ButtonInteraction} interaction 
     */
    execute: async interaction => {
        if (!interaction.inGuild()) {
            interaction.error("This must be ran in The Adventures Guild!");
            return;
        }

        if (!interaction.customId.startsWith("zomboidadd-") && !interaction.customId.startsWith("zomboidden-")) return;

        const split = interaction.customId.split("-");
        const command = split[0];
        const user = split[1];
        const pw = split[2]

        let users = await con.pquery("select id from zomboid__user where username = ?;", [user]);
        let userObj;
        
        if (users.length > 0) {
            try {
                userObj = await global.discord.users.fetch(users[0].id);
            } catch(err) {
                console.error(err);
                interaction.error("Failed to retrieve Discord user");
                return;
            }
        } else {
            interaction.error("Failed to find user");
            return;
        }

        if (command === "zomboidadd") {
            const embed = new EmbedBuilder()
                .setTitle("Added to Zomboid whitelist!")
                .setDescription("View your user information below.")
                .setColor(0x2dce3d)
                .setFields([
                    {
                        name: "Username",
                        value: codeBlock(user),
                        inline: true,
                    },
                    {
                        name: "Password",
                        value: codeBlock(pw),
                        inline: true,
                    }
                ]);

            userObj.send({embeds: [embed]}).then(msg => {
                interaction.success("Successfully sent DM message to user!");

                interaction.message.delete().catch(console.error);
            }, err => {
                console.error(err);
                interaction.error(`Failed to send DM!\nPlease manually send username/password to user. Username: ${codeBlock(user)} Password: ${codeBlock(pw)}`);
                interaction.message.delete();
            });
        } else if (command === "zomboidden") {
            interaction.showModal(
                new ModalBuilder()
                    .setCustomId("zomboidden-" + user + "-" + pw)
                    .setTitle("Deny Request")
                    .setComponents(
                        new ActionRowBuilder()
                            .setComponents(
                                new TextInputBuilder()
                                    .setCustomId("reason")
                                    .setLabel("Reason for Denial")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setPlaceholder("ex: 'Username already exists'")
                            )
                    )
            );
        } else {
            interaction.error("Unknown command")
        }

    }
}

module.exports = listener;