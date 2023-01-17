const {  ButtonInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ActionRowBuilder  } = require("discord.js");
const config = require("../../config.json");

const listener = {
    name: "roleEmbedListener",
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

        if (!interaction.customId.startsWith("roles-")) return;

        const category = interaction.customId.replace("roles-", "");

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("roles-" + category)
            .setMinValues(0)
            .setPlaceholder("Select roles to add them!");
        
        let roles = config.roles
            .filter(x => x.type === category)
            .sort((a,b) => b - a);
        
        roles.forEach(role => {
            let option = new StringSelectMenuOptionBuilder()
                .setLabel(role.name)
                .setValue(role.role);

            if (role.hasOwnProperty("emoji")) option.setEmoji(role.emoji);
            
            if (interaction.member.roles.cache.has(role.role)) {
                option.setDefault(true);
            }

            selectMenu.addOptions(option);
        });

        selectMenu.setMaxValues(selectMenu.options.length);

        const row = new ActionRowBuilder()
            .addComponents(selectMenu);

        const embed = new EmbedBuilder()
            .setTitle("Select Roles")
            .setDescription("**Use the select menu below to set your " + category + " roles**\nUse `/roles <category>` to choose another category.")
            .setColor(0xf28227);

        interaction.reply({embeds: [embed], components: [row], ephemeral: true})
            .catch(console.error);
    }
}

module.exports = listener;