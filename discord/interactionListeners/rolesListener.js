const { EmbedBuilder } = require("@discordjs/builders");
const { StringSelectMenuInteraction } = require("discord.js");
const config = require("../../config.json");

const listener = {
    name: "rolesListener",
    verify: interaction => interaction.isStringSelectMenu(),
    /**
     * Executor for this listener
     * @param {StringSelectMenuInteraction} interaction 
     */
    execute: async interaction => {
        if (!interaction.customId.startsWith("roles-")) return;

        const category = interaction.customId.replace("roles-","");

        const categoryRoles = config.roles
            .filter(x => x.type === category);

        let addRoles = [];
        let removeRoles = [];
        categoryRoles.forEach(role => {
            if (interaction.values.includes(role.role)) {
                if (!interaction.member.roles.cache.has(role.role)) {
                    addRoles.push(role.role);
                }
            } else {
                if (interaction.member.roles.cache.has(role.role)) {
                    removeRoles.push(role.role);
                }
            }
        });
        
        if (removeRoles.length > 0) {
            interaction.member.roles.remove(removeRoles).catch(err => {
                console.error(err);
            });
        }

        if (addRoles.length > 0) {
            interaction.member.roles.add(addRoles).catch(err => {
                console.error(err);
            });
        }

        const embed = new EmbedBuilder()
                .setTitle("Roles Updated!")
                .setDescription("Your roles were successfully updated!")
                .setColor(0x2dce3d);

        if (addRoles.length > 0) {
            embed.addFields({
                name: "Added Roles",
                value: addRoles.map(x => `<@&${x}>`).join("\n"),
            });
        }
        if (removeRoles.length > 0) {
            embed.addFields({
                name: "Removed Roles",
                value: removeRoles.map(x => `<@&${x}>`).join("\n"),
            });
        }

        interaction.reply({embeds: [embed], ephemeral: true})
            .catch(console.error);
    }
}

module.exports = listener;