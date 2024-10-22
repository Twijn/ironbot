const { EmbedBuilder, cleanCodeBlockContent, codeBlock, ButtonBuilder, ButtonStyle, ActionRowBuilder, inlineCode } = require("discord.js");
const mongoose = require("mongoose");

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
        .setFooter({iconURL: "https://www.illumindal.com/assets/images/icons/illumindal_120px.png", text: "The Illumindal Guild"});

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

module.exports = mongoose.model("Server", schema);
