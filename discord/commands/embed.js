const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const command = {
    data: new SlashCommandBuilder()
        .setName("embed")
        .setDescription("Sends a display embed in the channel you're focused on.")
        .addSubcommand(subcommand => 
            subcommand
                .setName("roles")
                .setDescription("Designed embed for role selection")
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

        const subcommand = interaction.options.getSubcommand(true);

        if (subcommand === "roles") {
            const embed = new EmbedBuilder()
                .setTitle("Modify your game, platform, and creator roles!")
                .setDescription("**Use the buttons below to open up menus to add and remove your custom roles.**\nYou can also use `/roles` to change each category in any channel!")
                .setColor(0xf28227);

            const platforms = new ButtonBuilder()
                .setCustomId("roles-platform")
                .setLabel("Platforms")
                .setEmoji("💻")
                .setStyle(ButtonStyle.Secondary);

            const creator = new ButtonBuilder()
                .setCustomId("roles-creator")
                .setLabel("Content Creator")
                .setEmoji("📽️")
                .setStyle(ButtonStyle.Secondary);

            const games = new ButtonBuilder()
                .setCustomId("roles-game")
                .setLabel("Games")
                .setEmoji("🎮")
                .setStyle(ButtonStyle.Secondary);

            const misc = new ButtonBuilder()
                .setCustomId("roles-miscellaneous")
                .setLabel("Miscellaneous")
                .setEmoji("🎲")
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder()
                .addComponents(platforms, creator, games, misc);

            interaction.channel.send({embeds: [embed], components: [row]})
                .catch(console.error);
                
            interaction.success("Sent the message!")
                .catch(console.error);
        } else {
            interaction.error("Unknown embed!")
                .catch(console.error);
        }
    }
}

module.exports = command;