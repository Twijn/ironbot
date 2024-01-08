const { EmbedBuilder, cleanCodeBlockContent, codeBlock } = require("discord.js");
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
    return new EmbedBuilder()
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
}

module.exports = mongoose.model("Server", schema);
