const {  codeBlock, EmbedBuilder, ModalSubmitInteraction  } = require("discord.js");

const con = require("../../database");

const listener = {
    name: "zomboidModals",
    verify: interaction => interaction.isModalSubmit(),
    /**
     * Executor for this listener
     * @param {ModalSubmitInteraction} interaction 
     */
    execute: async interaction => {
        if (!interaction.inGuild()) {
            interaction.error("This must be ran in The Adventures Guild!");
            return;
        }

        if (!interaction.customId.startsWith("zomboidden-")) return;

        const split = interaction.customId.split("-");
        const user = split[1];

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

        const embed = new EmbedBuilder()
            .setTitle("Unable to add to PZ whitelist!")
            .setDescription("Your request to join the PZ server was denied.")
            .setFields([
                {
                    name: "Reason",
                    value: codeBlock(interaction.fields.getTextInputValue("reason")),
                }
            ])
            .setColor(0xd63939);

        con.query("delete from zomboid__user where id = ?;", [userObj.id], err => {
            if (err) console.error(err);
        });

        userObj.send({embeds: [embed]}).then(msg => {
            interaction.success("Sent deny message!");
            interaction.message.delete();
        }, err => {
            console.error(err);
            interaction.error("Failed to send DM. Please inform the user " + userObj + " manually.");
            interaction.message.delete();
        });
    }
}

module.exports = listener;