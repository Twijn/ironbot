const { EmbedBuilder, cleanCodeBlockContent, codeBlock, ButtonBuilder, ButtonStyle, ActionRowBuilder, inlineCode } = require("discord.js");
const mongoose = require("mongoose");

const Application = require("./Application");
const ApplicationValue = require("./ApplicationValue");

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    game: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    role: {
        type: String,
    },
    host: {
        type: String,
        ref: "DiscordUser",
        required: true,
    },
    operator: {
        type: String,
        ref: "DiscordUser",
        required: true,
    },
    form: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ApplicationForm",
    },
    rules: {
        type: [String],
        default: [],
    },
    mention: {
        type: String,
        default: "",
    },
    joinInstructionsUrl: {
        type: String,
        default: "",
    },
    joinPassword: String,
    mods: {
        type: [String],
        default: null,
    },
    pterodactylId: {
        type: String,
        default: null,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

schema.methods.createEmbed = function(created = false) {
    const embed = new EmbedBuilder()
        .setTitle(created ? "Server Created!" : this.name)
        .setColor(created ? 0x2dce3d : 0xf28227)
        .setThumbnail(this.imageUrl)
        .addFields({
            name: "Name",
            value: codeBlock(cleanCodeBlockContent(this.name)),
            inline: true,
        }, {
            name: "Game",
            value: codeBlock(cleanCodeBlockContent(this.game)),
            inline: true,
        }, {
            name: "Description",
            value: codeBlock(cleanCodeBlockContent(this.description)),
            inline: false,
        }, {
            name: "Host",
            value: `<@${this.host._id}>`,
            inline: true,
        }, {
            name: "Operator",
            value: `<@${this.operator._id}>`,
            inline: true,
        })
        .setFooter({text: `Server ID ${String(this._id)}`, iconURL: "https://autumnsdawn.net/assets/images/icons/illumindal_120px.png"});

    if (this.role) {
        embed.addFields({
            name: "User Role",
            value: `<@&${this.role}>`,
            inline: true,
        });
    }
    
    if (this.rules && this.rules.length > 0) {
        embed.addFields({
            name: "Rules",
            value: this.rules.map((rule, i) => `${i + 1}. ${rule.replace("{{operator}}", `<@${this.operator._id}>`).replace("{{host}}", `<@${this.host._id}>`)}`).join("\n"),
            inline: false,
        });
    }

    if (this.mods && this.mods.length > 0) {
        embed.addFields({
            name: "Mods",
            value: this.mods.map(x => inlineCode(x)).join(" "),
            inline: false,
        })
    }

    return embed;
}

const memberCache = {};
schema.methods.getMembers = async function(onlyAccepted = true) {
    if (memberCache.hasOwnProperty(String(this._id))) {
        return memberCache[String(this._id)]
            .filter(x => !onlyAccepted || x.accepted);
    }

    const members = await Application.find({server: this})
        .populate(["server","identity","twitchUser","discordUser","steamUser"]);

    memberCache[String(this._id)] = members;

    return members
        .filter(x => !onlyAccepted || x.accepted);
}

schema.methods.apply = async function(identity, data) {
    if (!this.form?._id) {
        throw "This server does not have a form attached, and therefore you may not apply to it!";
    }

    const serverMember = (await this.getMembers(false)).find(x => String(identity._id) === String(x.identity._id));
    if (serverMember) {
        throw `You have already applied to ${this.name}${serverMember.accepted ? " and have been accepted" : ""}!`;
    }

    const form = this.form;

    // User validation
    if (form.requireDiscord && !data.discordUser) {
        throw "Missing Discord user!";
    }
    if (form.requireSteam && !data.steamUser) {
        throw "Missing Steam user!";
    }
    if (form.requireTwitch && !data.twitchUser) {
        throw "Missing Twitch user!";
    }

    // Input validation
    const inputs = await form.getInputs();

    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        let value = data[input.name];
        if (!value && input.required) {
            throw `Required input ${input.label} is missing!`;
        }
        if (input.type === "text") {
            if (input?.text?.minlength && value.length < input.text.minlength) {
                throw `Input ${input.label} does not match minimum length requirement of ${input.text.minlength}!`;
            }
            if (input?.text?.maxlength && value.length < input.text.maxlength) {
                throw `Input ${input.label} does not match maximum length requirement of ${input.text.maxlength}!`;
            }
        } else if (input.type === "number") {
            value = Number(value);
            if (isNaN(value)) {
                throw `Input ${input.label} is not a number!`;
            }
            if (input?.number?.min && value < input.number.min) {
                throw `Input ${input.label} does not match minimum number requirement of ${input.number.min}!`;
            }
            if (input?.number?.max && value > input.number.max) {
                throw `Input ${input.label} does not match minimum number requirement of ${input.number.max}!`;
            }
        }
    }

    const application = await Application.create({
        server: this,
        identity,
        discordUser: data.discordUser,
        steamUser: data.steamUser,
        twitchUser: data.twitchUser,
    });

    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const d = {
            application,
            input,
        };
        d[input.type] = data[input.name];
        try {
            await ApplicationValue.create(d);
        } catch(err) {
            console.error("An unknown error occurred!");
            throw String(err);
        }
    }

    delete memberCache[String(this._id)];
    global.utils.dumpMemberServers(identity);

    try {
        const accept = new ButtonBuilder()
            .setCustomId(`acceptapp-${application._id}`)
            .setLabel("Accept Application")
            .setEmoji("☑️")
            .setStyle(ButtonStyle.Success);

        const deny = new ButtonBuilder()
            .setCustomId(`denyapp-${application._id}`)
            .setLabel("Deny Application")
            .setEmoji("⚠️")
            .setStyle(ButtonStyle.Danger);

        const message = await global.utils.channels.applications.send({
            content: this.mention ? this.mention : "",
            embeds: [await application.createEmbed()],
            components: [
                new ActionRowBuilder()
                    .setComponents(accept, deny),
            ]
        });
        utils.Schemas.DiscordMessage.create({
            _id: message.id,
            channel: message.channelId,
            application,
        }).catch(console.error);
    } catch(err) {
        console.error(err);
        throw `The application for ${this.name} went through, but we failed to inform the server operators of the application. Please notify the server operator directly, or contact a Head Master.`;
    }

    return application;
}

module.exports = mongoose.model("Server", schema);
