const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");

const utils = require("../../utils/");

const command = {
    data: new SlashCommandBuilder()
        .setName("admin")
        .setDescription("Administrator actions")
        .addSubcommandGroup(group => 
            group
                .setName("envoy")
                .setDescription("Manage envoy livestream notifications in a channel")
                .addSubcommand(subcommand => 
                    subcommand
                        .setName("create")
                        .setDescription("Creates an envoy livestream listener in the current channel")
                        .addStringOption(opt => 
                            opt
                                .setName("twitch-user")
                                .setDescription("The Twitch username of the specified Envoy")
                                .setRequired(true)
                                .setMinLength(2)
                                .setMaxLength(25)
                        )
                        .addUserOption(opt => 
                            opt
                                .setName("discord-user")
                                .setDescription("The Discord user of the specified Envoy")
                                .setRequired(true)
                        )
                        .addRoleOption(opt => 
                            opt
                                .setName("mention-role-1")
                                .setDescription("The first role to mention in the post (if any)")
                        )
                        .addRoleOption(opt => 
                            opt
                                .setName("mention-role-2")
                                .setDescription("The second role to mention in the post (if any)")
                        )
                        .addRoleOption(opt => 
                            opt
                                .setName("mention-role-3")
                                .setDescription("The third role to mention in the post (if any)")
                        )
                        .addBooleanOption(opt => 
                            opt
                                .setName("mention-everyone")
                                .setDescription("Whether the announcement should mention @everyone. Default: false")
                        )
                )
                .addSubcommand(subcommand => 
                    subcommand
                        .setName("delete")
                        .setDescription("Deletes an envoy livestream listener")
                        .addStringOption(opt => 
                            opt
                                .setName("listener")
                                .setDescription("The listener to be deleted")
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                )
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(0),
    /**
     * Executor for this chat command
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute: async interaction => {
        const group = interaction.options.getSubcommandGroup(true);
        const subcommand = interaction.options.getSubcommand(true);

        if (group === "envoy") {
            if (subcommand === "create") {
                const twitchUsername = interaction.options.getString("twitch-user", true);
                const discordDUser = interaction.options.getUser("discord-user", true);

                const mentionEveryone = interaction.options.getBoolean("mention-everyone", false);
                const role1 = interaction.options.getRole("mention-role-1", false);
                const role2 = interaction.options.getRole("mention-role-2", false);
                const role3 = interaction.options.getRole("mention-role-3", false);

                let mentionRoles = [];

                if (mentionEveryone) mentionRoles.push(interaction.guild.roles.everyone);
                if (role1) mentionRoles.push(role1);
                if (role2) mentionRoles.push(role2);
                if (role3) mentionRoles.push(role3);

                mentionRoles = mentionRoles.map(x => `<@&${x.id}>`).join(" ");

                let twitchUser;

                try {
                    twitchUser = await utils.Twitch.getUserByName(twitchUsername, true);
                } catch(err) {
                    console.error(err);
                }

                if (!twitchUser) {
                    return interaction.error(`The specified Twitch user (\`${twitchUsername}\`) could not be found!`);
                }

                let discordUser;

                try {
                    discordUser = await utils.Discord.getUserById(discordDUser.id, false, true);
                } catch(err) {
                    console.error(err);
                }

                if (!twitchUser) {
                    return interaction.error(`The specified Twitch user (\`${twitchUsername}\`) could not be found!`);
                }

                if (!twitchUser) {
                    return interaction.error(`The specified Discord user (\`${discordDUser?.username}\`) could not be found!`);
                }

                utils.EnvoyListenerManager.createListener(twitchUser, discordUser, interaction.channel, mentionRoles).then(listener => {
                    interaction.success(`Listener created!\nWatching the Twitch channel \`${twitchUser.display_name}\` for Discord user <@${discordDUser.id}> in text channel ${interaction.channel.url}`)
                }, interaction.error);
            } else if (subcommand === "delete") {
                const listener = interaction.options.getString("listener", true);
                utils.EnvoyListenerManager.removeListener(listener).then(() => {
                    interaction.success("Listener removed!")
                }, err => {
                    if (typeof(err) === "string") {
                        interaction.error(err);
                    } else {
                        console.error(err);
                        interaction.error("An unknown error occurred!");
                    }
                });
            } else {
                interaction.error("Could not recognize subcommand!");
            }
        } else {
            interaction.error("Could not recognize subcommand group!");
        }
    }
}

module.exports = command;