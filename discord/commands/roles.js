const { SlashCommandBuilder, ChatInputCommandInteraction, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const config = require("../../config.json");

const command = {
    data: new SlashCommandBuilder()
        .setName("roles")
        .setDescription("Add, remove, and set your gaming system, game, and news roles!")
        .addSubcommand(subcommand => 
            subcommand
                .setName("news")
                .setDescription("Modify your news roles to be mentioned in what you're interested in!")
        )
        .addSubcommand(subcommand => 
            subcommand
                .setName("platform")
                .setDescription("Modify roles to show gaming systems you play on!")
        )
        .addSubcommand(subcommand => 
            subcommand
                .setName("game")
                .setDescription("Modify game roles such as Minecraft, Project Winter, and Star Citizen")
        )
        .addSubcommand(subcommand => 
            subcommand
                .setName("unique")
                .setDescription("Modify miscellaneous roles such as the Shopper role")
        ),
    /**
     * Executor for this chat command
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute: async interaction => {
        if (!interaction.inGuild()) {
            interaction.error("This must be ran in The Adventures Guild!");
            return;
        }

        const category = interaction.options.getSubcommand(true);

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

module.exports = command;