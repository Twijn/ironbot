const { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, SlashCommandSubcommandBuilder, codeBlock } = require("discord.js");

const command = {
    data: new SlashCommandBuilder()
        .setName("embed")
        .setDescription("Sends a display embed in the channel you're focused on.")
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("roles")
                .setDescription("Designed embed for role selection")
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("zomboid")
                .setDescription("Sends Project Zomboid server details")
        )
        .setDMPermission(false),
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
                .setTitle("Modify your game, gaming system, and creator roles!")
                .setDescription("**Use the buttons below to open up menus to add and remove your custom roles.**\nYou can also use `/roles` to change each category in any channel!")
                .setColor(0xf28227);

            const news = new ButtonBuilder()
                .setCustomId("roles-news")
                .setLabel("News Roles")
                .setEmoji("📰")
                .setStyle(ButtonStyle.Secondary);

            const platforms = new ButtonBuilder()
                .setCustomId("roles-platform")
                .setLabel("Gaming Systems")
                .setEmoji("💻")
                .setStyle(ButtonStyle.Secondary);

            const games = new ButtonBuilder()
                .setCustomId("roles-game")
                .setLabel("Games")
                .setEmoji("🎮")
                .setStyle(ButtonStyle.Secondary);

            const misc = new ButtonBuilder()
                .setCustomId("roles-unique")
                .setLabel("Unique")
                .setEmoji("🎲")
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder()
                .addComponents(news, platforms, games, misc);

            interaction.channel.send({embeds: [embed], components: [row]})
                .then(message => {
                    interaction.success("Sent the message!")
                        .catch(console.error);
                })
                .catch(console.error);
        } else if (subcommand === "zomboid") {
            const embed = new EmbedBuilder()
                .setTitle("Project Zomboid Server Details")
                .setDescription("**Project Zomboid Community Server**\nAccess to the `Project Zomboid` server can be requested using `/zomboid request`, with the `username` field being your requested PZ username.")
                .setColor(0xcf7b2d)
                .setFields([
                    {
                        name: "Server IP",
                        value: codeBlock("zomboid.autumnsdawn.net"),
                        inline: true,
                    },
                    {
                        name: "Port",
                        value: codeBlock("16261"),
                        inline: true,
                    },
                    {
                        name: "Server Password",
                        value: codeBlock("R3C9q9FY"),
                        inline: true,
                    },
                    {
                        name: "User Credentials",
                        value: "User credentials must be requested by a moderator.\nPlease do so using the following command:" + codeBlock("/zomboid request") + "Note: Commands are not allowed in this channel. Please run the command [here](https://discord.com/channels/859283517451010088/1083050189822107649).",
                        inline: false,
                    },
                ]);

                interaction.channel.send({embeds: [embed]})
                    .then(message => {
                        interaction.success("Sent the message!")
                            .catch(console.error);
                    })
                    .catch(console.error);
        } else {
            interaction.error("Unknown embed!")
                .catch(console.error);
        }
    }
}

module.exports = command;