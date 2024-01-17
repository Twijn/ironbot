const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

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
        .addSubcommandGroup(group => 
            group
                .setName("server")
                .setDescription("Server administration options")
                .addSubcommand(subcommand => 
                    subcommand
                        .setName("create")
                        .setDescription("Creates a community server")
                        .addStringOption(opt => 
                            opt
                                .setName("game")
                                .setDescription("The name of the game.")
                                .setRequired(true)
                                .setMinLength(3)
                                .setMaxLength(25)
                        )
                        .addStringOption(opt => 
                            opt
                                .setName("imageurl")
                                .setDescription("The image URL for the server game.")
                                .setRequired(true)
                                .setMinLength(1)
                                .setMaxLength(99)
                        )
                        .addUserOption(opt => 
                            opt
                                .setName("host")
                                .setDescription("The host of the server")
                                .setRequired(true)
                        )
                        .addUserOption(opt => 
                            opt
                                .setName("operator")
                                .setDescription("The operator of the server")
                                .setRequired(true)
                        )
                        .addStringOption(opt => 
                            opt
                                .setName("name")
                                .setDescription("The name of the server. Defaults to the game's name")
                                .setRequired(false)
                                .setMinLength(3)
                                .setMaxLength(25)
                        )
                        .addStringOption(opt => 
                            opt
                                .setName("description")
                                .setDescription("The description of the server.")
                                .setRequired(false)
                                .setMinLength(3)
                                .setMaxLength(150)
                        )
                        .addStringOption(opt => 
                            opt
                                .setName("pterodactylid")
                                .setDescription("The Pterodactyl ID for the server, if hosted by Twijn.")
                                .setRequired(false)
                                .setMinLength(36)
                                .setMaxLength(36)
                        )
                )
                .addSubcommand(subcommand => 
                    subcommand
                        .setName("edit")
                        .setDescription("Edits a community server")
                        .addStringOption(opt => 
                            opt
                                .setName("server")
                                .setDescription("The server to edit.")
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                        .addNumberOption(opt => 
                            opt
                                .setName("page")
                                .setDescription("The page number (1-3: Main, 4+ Rules)")
                                .setRequired(true)
                                .setMinValue(1)
                                .setMaxValue(10)
                        )
                )
                .addSubcommand(subcommand => 
                    subcommand
                        .setName("channeladd")
                        .setDescription("Adds channel to the specified server")
                        .addStringOption(opt => 
                            opt
                                .setName("server")
                                .setDescription("The server to edit.")
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                        .addStringOption(opt => 
                            opt
                                .setName("type")
                                .setDescription("The type of channel")
                                .setChoices(
                                    {
                                        name: "General Chat",
                                        value: "chat",
                                    },
                                    {
                                        name: "Announcement",
                                        value: "announcement",
                                    }
                                )
                                .setRequired(true)
                        )
                    )
                .addSubcommand(subcommand => 
                    subcommand
                        .setName("setform")
                        .setDescription("Sets the form for a community server")
                        .addStringOption(opt => 
                            opt
                                .setName("server")
                                .setDescription("The server to set the form")
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                        .addStringOption(opt => 
                            opt
                                .setName("form")
                                .setDescription("The form to set")
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                )
                .addSubcommand(subcommand => 
                    subcommand
                        .setName("channelclear")
                        .setDescription("Clears all servers from the current channel")
                )
        )
        .addSubcommandGroup(group => 
            group
                .setName("form")
                .setDescription("Manage forms")
                .addSubcommand(subcommand => 
                    subcommand
                        .setName("new")
                        .setDescription("Creates a new Form")
                        .addStringOption(opt => 
                            opt
                                .setName("name")
                                .setDescription("The name of the form")
                                .setRequired(true)
                        )
                        .addBooleanOption(opt => 
                            opt
                                .setName("require-steam")
                                .setDescription("Whether the form requires a Steam account")
                                .setRequired(true)
                        )
                        .addBooleanOption(opt => 
                            opt
                                .setName("require-twitch")
                                .setDescription("Whether the form requires a Twitch account")
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand => 
                    subcommand
                        .setName("newinput")
                        .setDescription("Creates a new Input")
                        .addStringOption(opt => 
                            opt
                                .setName("name")
                                .setDescription("The name of the input")
                                .setRequired(true)
                        )
                        .addStringOption(opt => 
                            opt
                                .setName("label")
                                .setDescription("The label of the input")
                                .setRequired(true)
                        )
                        .addStringOption(opt => 
                            opt
                                .setName("type")
                                .setDescription("The type of the input")
                                .setRequired(true)
                                .setChoices(
                                    {
                                        name: "Text",
                                        value: "text",
                                    },
                                    {
                                        name: "Number",
                                        value: "number"
                                    }
                                )
                        )
                        .addBooleanOption(opt => 
                            opt
                                .setName("required")
                                .setDescription("Whether the input is required or not")
                                .setRequired(true)
                        )
                        .addStringOption(opt => 
                            opt
                                .setName("placeholder")
                                .setDescription("The placeholder of the input")
                                .setRequired(false)
                        )
                        .addIntegerOption(opt => 
                            opt
                                .setName("minlength")
                                .setDescription("The minimum length of the text input")
                                .setMinValue(1)
                                .setMaxValue(2048)
                                .setRequired(false)
                        )
                        .addIntegerOption(opt => 
                            opt
                                .setName("maxlength")
                                .setDescription("The maximum length of the text input")
                                .setMinValue(1)
                                .setMaxValue(2048)
                                .setRequired(false)
                        )
                        .addNumberOption(opt => 
                            opt
                                .setName("min")
                                .setDescription("The minimum of a number input")
                                .setRequired(false)
                        )
                        .addNumberOption(opt => 
                            opt
                                .setName("max")
                                .setDescription("The maximum of a number input")
                                .setRequired(false)
                        )
                        .addNumberOption(opt => 
                            opt
                                .setName("step")
                                .setDescription("The step of a number input")
                                .setRequired(false)
                        )
                )
                .addSubcommand(subcommand => 
                    subcommand
                        .setName("addinput")
                        .setDescription("Adds an input to a form")
                        .addStringOption(opt => 
                            opt
                                .setName("form")
                                .setDescription("The form to add the input to")
                                .setAutocomplete(true)
                                .setRequired(true)
                        )
                        .addStringOption(opt => 
                            opt
                                .setName("input")
                                .setDescription("The input to add")
                                .setAutocomplete(true)
                                .setRequired(true)
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
        } else if (group === "server") {
            if (subcommand === "create") {
                let name = interaction.options.getString("name", false);
                const game = interaction.options.getString("game", true);
                let description = interaction.options.getString("description", false);
                const imageUrl = interaction.options.getString("imageurl", true);
                const host = interaction.options.getUser("host", true);
                const operator = interaction.options.getUser("operator", true);
                const pterodactylId = interaction.options.getString("pterodactylid", false);

                if (!name) name = game;
                if (!description) description = `Come join our ${game} server! Connection details on Discord.`;

                await utils.Discord.getUserById(host.id, false, true);

                if (host.id !== operator.id) {
                    await utils.Discord.getUserById(operator.id, false, true);
                }

                const server = await utils.Schemas.Server.create({
                    name,
                    game,
                    description,
                    imageUrl,
                    host: host.id,
                    operator: operator.id,
                    pterodactylId,
                });

                await server.populate(["host","operator"])

                utils.servers.push(server);
                utils.servers.sort((a, b) => a.name - b.name);

                interaction.reply({embeds: [server.createEmbed(true)], ephemeral: true});
            }

            const server = utils.servers.find(x => String(x._id) === interaction.options.getString("server", true));

            if (!server) {
                return interaction.error("Could not find server!");
            }
            
            if (subcommand === "edit") {
                const page = interaction.options.getNumber("page", true);
                let modal = new ModalBuilder()
                    .setCustomId(`editserver-${String(server._id)}-${page}`)
                    .setTitle(`Edit ${server.name}`);

                if (page === 1) {
                    modal.setComponents(
                        new ActionRowBuilder()
                            .setComponents(
                                new TextInputBuilder()
                                    .setCustomId("name")
                                    .setLabel("Name")
                                    .setValue(server.name)
                                    .setStyle(TextInputStyle.Short)
                                    .setRequired(true)
                            ),
                        new ActionRowBuilder()
                            .setComponents(
                                new TextInputBuilder()
                                    .setCustomId("game")
                                    .setLabel("Game")
                                    .setValue(server.game)
                                    .setStyle(TextInputStyle.Short)
                                    .setRequired(true)
                            ),
                        new ActionRowBuilder()
                            .setComponents(
                                new TextInputBuilder()
                                    .setCustomId("description")
                                    .setLabel("Description")
                                    .setValue(server.description)
                                    .setStyle(TextInputStyle.Paragraph)
                                    .setRequired(true)
                            ),
                        new ActionRowBuilder()
                            .setComponents(
                                new TextInputBuilder()
                                    .setCustomId("imageUrl")
                                    .setLabel("Image URL")
                                    .setValue(server.imageUrl)
                                    .setStyle(TextInputStyle.Short)
                                    .setRequired(true)
                            ),
                        new ActionRowBuilder()
                            .setComponents(
                                new TextInputBuilder()
                                    .setCustomId("role")
                                    .setLabel("Role ID")
                                    .setValue(server.role ? server.role : "")
                                    .setStyle(TextInputStyle.Short)
                                    .setRequired(true)
                            )
                    );      
                } else if (page === 2) {
                    modal.setComponents(
                        new ActionRowBuilder()
                            .setComponents(
                                new TextInputBuilder()
                                    .setCustomId("host")
                                    .setLabel("Host")
                                    .setValue(server.host._id)
                                    .setStyle(TextInputStyle.Short)
                                    .setRequired(true)
                            ),
                        new ActionRowBuilder()
                            .setComponents(
                                new TextInputBuilder()
                                    .setCustomId("operator")
                                    .setLabel("Operator")
                                    .setValue(server.operator._id)
                                    .setStyle(TextInputStyle.Short)
                                    .setRequired(true)
                            ),
                        new ActionRowBuilder()
                            .setComponents(
                                new TextInputBuilder()
                                    .setCustomId("mention")
                                    .setLabel("Mention")
                                    .setValue(server.mention ? server.mention : "")
                                    .setStyle(TextInputStyle.Short)
                                    .setRequired(false)
                            ),
                        new ActionRowBuilder()
                            .setComponents(
                                new TextInputBuilder()
                                    .setCustomId("pterodactylId")
                                    .setLabel("Pterodactyl ID")
                                    .setValue(server.pterodactylId ? server.pterodactylId : "")
                                    .setStyle(TextInputStyle.Short)
                                    .setRequired(false)
                            )
                    );
                } else if (page === 3) {
                    modal.setComponents(
                        new ActionRowBuilder()
                            .setComponents(
                                new TextInputBuilder()
                                    .setCustomId("joinInstructionsUrl")
                                    .setLabel("Join Instructions (URL)")
                                    .setPlaceholder("URL to a forum post/message")
                                    .setValue(server.joinInstructionsUrl ? server.joinInstructionsUrl : "")
                                    .setStyle(TextInputStyle.Short)
                                    .setRequired(true)
                            ),
                        new ActionRowBuilder()
                            .setComponents(
                                new TextInputBuilder()
                                    .setCustomId("joinPassword")
                                    .setLabel("Join Password")
                                    .setValue(server.joinPassword ? server.joinPassword : "")
                                    .setStyle(TextInputStyle.Short)
                                    .setRequired(false)
                            ),
                        new ActionRowBuilder()
                            .setComponents(
                                new TextInputBuilder()
                                    .setCustomId("mods")
                                    .setLabel("Mods")
                                    .setValue(server.mods ? server.mods.join("\n") : "")
                                    .setStyle(TextInputStyle.Paragraph)
                                    .setMaxLength(950)
                                    .setRequired(false)
                            )
                    );
                } else {
                    const ruleOffset = page - 4;
                    let rules = ["","","","",""];
                    for (let i = ruleOffset * 5; i < (ruleOffset + 1) * 5; i++) {
                        if (server.rules[i]) {
                            rules[i - (ruleOffset * 5)] = server.rules[i];
                        }
                    }
                    rules.forEach((rule,i) => {
                        modal.addComponents(
                            new ActionRowBuilder()
                                .setComponents(
                                    new TextInputBuilder()
                                        .setCustomId(`rule-${(ruleOffset * 5) + i}`)
                                        .setLabel(`Rule ${(ruleOffset * 5) + i + 1}`)
                                        .setValue(rule)
                                        .setStyle(TextInputStyle.Paragraph)
                                        .setRequired(false)
                                )
                        )
                    });
                }

                interaction.showModal(modal).catch(console.error);

                interaction.awaitModalSubmit({
                    time: 15 * 60 * 1000,
                    filter: interaction => interaction.customId === `editserver-${String(server._id)}-${page}`,
                }).then(async modalInteraction => {
                    if (page < 4) {
                        const opts = ["name","game","description","role","imageUrl","host","operator","mention","pterodactylId","joinInstructionsUrl","joinPassword","mods"];
                        let updatedProps = [];
                        for (let i = 0; i < opts.length; i++) {
                            try {
                                const opt = opts[i];
                                let value = modalInteraction.fields.getTextInputValue(opt);
                                if (value) {
                                    if (opt === "host" || opt === "operator") {
                                        value = await utils.Discord.getUserById(value, false, true);
                                    }
                                    if (opt === "mods") {
                                        value = value.split("\n").map(x => x.trim());
                                    }
                                    server[opt] = value;
                                }
                                updatedProps.push(opt);
                            } catch(err) {
                            }
                        }

                        await server.save();

                        modalInteraction.reply({
                            content: `Updated props: ${updatedProps.join(", ")}`,
                            embeds: [server.createEmbed()],
                            ephemeral: true,
                        });
                    } else {
                        const ruleOffset = (page - 4) * 5;
                        for (let i = 0; i < 5; i++) {
                            server.rules[ruleOffset + i] = modalInteraction.fields.getTextInputValue(`rule-${ruleOffset + i}`);
                        }
                        server.rules = server.rules.filter(x => x !== "");
                        await server.save();
                        modalInteraction.reply({
                            content: `Updated rules`,
                            embeds: [server.createEmbed()],
                            ephemeral: true,
                        });
                    }
                }).catch(console.error);
            } else if (subcommand === "setform") {
                const formId = interaction.options.getString("form", true);

                const form = await utils.Schemas.ApplicationForm.findById(formId);

                if (!form) {
                    return interaction.error("Unable to find the form!");
                }

                server.form = form;
                await server.save();

                interaction.success(`Set server \`${server.name}\` form to \`${form.name}\``)
            } else if (subcommand === "channeladd") {
                const channelType = interaction.options.getString("type", true);

                utils.Schemas.ServerChannel.create({
                    server,
                    channelType,
                    channel: interaction.channelId,
                }).then(() => {
                    interaction.success(`Added ${interaction.channel.url} to ${server.name}`)
                }, err => {
                    console.error(err);
                    interaction.error(String(err))
                });
            }
        } else if (group === "form") {
            if (subcommand === "new") {
                const name = interaction.options.getString("name", true);
                const requireSteam = interaction.options.getBoolean("require-steam", true);
                const requireTwitch = interaction.options.getBoolean("require-twitch", true);

                const checkExistingForm = await utils.Schemas.ApplicationForm.find({name});

                if (checkExistingForm.length > 0) {
                    return interaction.error(`Form with name \`${name}\` already exists!`);
                }

                utils.Schemas.ApplicationForm.create({
                    name,
                    requireDiscord: true,
                    requireSteam,
                    requireTwitch,
                }).then(form => {
                    interaction.success(`Form \`${form.name}\` was successfully created!`);
                }, err => {
                    interaction.errror(String(err));
                    console.error(err);
                });
            } else if (subcommand === "newinput") {
                const name = interaction.options.getString("name", true);
                const label = interaction.options.getString("label", true);
                const type = interaction.options.getString("type", true);
                const placeholder = interaction.options.getString("placeholder", false);
                const required = interaction.options.getBoolean("required", true);
                const minlength = interaction.options.getInteger("minlength", false);
                const maxlength = interaction.options.getInteger("maxlength", false);
                const min = interaction.options.getNumber("min", false);
                const max = interaction.options.getNumber("max", false);
                const step = interaction.options.getNumber("step", false);
                
                const checkExistingInput = await utils.Schemas.ApplicationInput.find({name});

                if (checkExistingInput.length > 0) {
                    return interaction.error(`Input with name \`${name}\` already exists!`);
                }

                const data = {
                    name,
                    label,
                    type,
                    required,
                };

                if (placeholder) data.placeholder = placeholder;

                if (type === "text" && (minlength || maxlength)) {
                    data.text = {};
                    if (minlength) data.text.minlength = minlength;
                    if (maxlength) data.text.maxlength = maxlength;
                }

                if (type === "number" && (min || max || step)) {
                    data.number = {};
                    if (min) data.number.min = min;
                    if (max) data.number.max = max;
                    if (step) data.number.step = step;
                }

                utils.Schemas.ApplicationInput.create(data).then(input => {
                    interaction.success(`Input \`${input.name}\` was successfully created!`);
                }, err => {
                    console.error(err);
                    interaction.error(String(err));
                });
            } else if (subcommand === "addinput") {
                const formId = interaction.options.getString("form", true);
                const inputId = interaction.options.getString("input", true);

                const form = await utils.Schemas.ApplicationForm.findById(formId);
                const input = await utils.Schemas.ApplicationInput.findById(inputId);

                if (!form) {
                    return interaction.error("Unable to find the form!");
                }
                if (!input) {
                    return interaction.error("Unable to find the input!");
                }

                const checkIfExists = await utils.Schemas.ApplicationFormInput.find({form, input});
                if (checkIfExists.length > 0) {
                    return interaction.error("Input is already attached to this form!");
                }

                await utils.Schemas.ApplicationFormInput.create({form, input});

                interaction.success(`Associated input \`${input.name}\` to \`${form.name}\`!`);
            }
        } else {
            interaction.error("Could not recognize subcommand group!");
        }
    }
}

module.exports = command;