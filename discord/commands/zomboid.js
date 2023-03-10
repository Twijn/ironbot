const { SlashCommandBuilder, ChatInputCommandInteraction, SlashCommandStringOption, SlashCommandSubcommandBuilder, Client, codeBlock, escapeCodeBlock, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

const con = require("../../database");
const config = require("../../config.json");

const USERNAME_REGEX = /^([a-zA-Z0-9_])+$/;

const command = {
    data: new SlashCommandBuilder()
        .setName("zomboid")
        .setDescription("Subcommand for Project Zomboid")
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("request")
                .setDescription("Requests access to the Project Zomboid server!")
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("username")
                        .setDescription("Requested username for PZ")
                        .setMinLength(3)
                        .setMaxLength(32)
                        .setRequired(true)
                )
        ),
    /**
     * Executor for this chat command
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute: async interaction => {
        let subcommand = interaction.options.getSubcommand();
        if (subcommand === "request") {
            let username = interaction.options.getString("username", true);

            if (USERNAME_REGEX.exec(username)) {
                con.query("select id from zomboid__user where id = ?;", [interaction.user.id], (err, res) => {
                    if (!err) {
                        if (res.length === 0) {
                            con.query("select id from zomboid__user where username = ?;", [username], (err2, res2) => {
                                if (!err2) {
                                    if (res2.length === 0) {
                                        con.query("insert into zomboid__user (id, username) values (?, ?);", [interaction.user.id, username], err3 => {
                                            if (!err3) {
                                                global.discord.channels.fetch(config.zomboid.mod_channel).then(channel => {
                                                    const password = con.stringGenerator(12)

                                                    const modEmbed = new EmbedBuilder()
                                                        .setTitle("Zomboid User Add Requested")
                                                        .setDescription("User <@" + interaction.user.id + "> has requested to join Zomboid!")
                                                        .setAuthor({
                                                            name: interaction.user.username,
                                                            iconURL: interaction.user.avatarURL(),
                                                        })
                                                        .setColor(0x22c9bc)
                                                        .setFields([
                                                            {
                                                                name: "Requested Username",
                                                                value: codeBlock(username),
                                                                inline: true,
                                                            },
                                                            {
                                                                name: "Generated Password",
                                                                value: codeBlock(password),
                                                                inline: true,
                                                            },
                                                            {
                                                                name: "Command",
                                                                value: codeBlock(`/adduser "${username}" "${password}"`),
                                                                inline: false,
                                                            }
                                                        ]);

                                                    const added = new ButtonBuilder()
                                                        .setCustomId(`zomboidadd-${username}-${password}`)
                                                        .setLabel("Accept")
                                                        .setStyle(ButtonStyle.Success);

                                                    const denied = new ButtonBuilder()
                                                        .setCustomId(`zomboidden-${username}-${password}`)
                                                        .setLabel("Deny")
                                                        .setStyle(ButtonStyle.Danger);

                                                    const row = new ActionRowBuilder()
                                                        .setComponents(added, denied);


                                                    channel.send({content: config.zomboid.mod_role.length > 0 ? `<@&${config.zomboid.mod_role}>` : "", embeds: [modEmbed], components: [row]}).then(msg => {
                                                        const embed = new EmbedBuilder()
                                                            .setTitle("Requested whitelist!")
                                                            .setDescription("You have requested to be added to the server under the username `" + escapeCodeBlock(username) + "`.\n**You will be sent a DM when you're added.**\nEnsure you can receive DMs from this server. [see how](https://i.twijn.dev/H10Q.gif)")
                                                            .setColor(0x2dce3d);
                                                        interaction.reply({embeds: [embed], ephemeral: true}).catch(console.error);
                                                    }, err => {
                                                        console.error(err);
                                                        interaction.error("Failed to send mod message");
                                                    });
                                                }, err => {
                                                    console.error(err);
                                                    interaction.error("Failed to send mod message");
                                                })
                                            }
                                        });
                                    } else {
                                        interaction.error("Username " + codeBlock(escapeCodeBlock(username)) + " already exists!");
                                    }
                                } else {
                                    console.error(err2);
                                    interaction.error("SQL error");
                                }
                            });
                        } else {
                            interaction.error("You already have a Zomboid account!");
                        }
                    } else {
                        console.error(err);
                        interaction.error("SQL error");
                    }
                });
            } else {
                interaction.error("Username must be alphanumeric or underscores.")
            }
        } else {
            interaction.error("Unknown subcommand!")
        }
    }
}

module.exports = command;