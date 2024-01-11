const mongoose = require("mongoose");
const { EmbedBuilder, codeBlock, cleanCodeBlockContent } = require("discord.js");

const ApplicationValue = require("./ApplicationValue");

const schema = new mongoose.Schema({
    server: {
        type: mongoose.Types.ObjectId,
        ref: "Server",
        index: true,
        required: true,
    },
    identity: {
        type: mongoose.Types.ObjectId,
        ref: "Identity",
        index: true,
        required: true,
    },
    discordUser: {
        type: String,
        ref: "DiscordUser",
        default: null,
    },
    steamUser: {
        type: String,
        ref: "SteamUser",
        default: null,
    },
    twitchUser: {
        type: String,
        ref: "TwitchUser",
        default: null,
    },
    submitted_at: {
        type: Date,
        default: Date.now,
    },
    accepted: {
        type: Boolean,
        default: false,
    },
});

schema.methods.getValues = function() {
    return ApplicationValue.find({application: this})
        .populate(["application","input"]);
}

schema.methods.createEmbed = async function() {
    const values = await this.getValues();

    const embed = new EmbedBuilder()
        .setColor(0xcf7b2d)
        .setThumbnail(this.server.imageUrl)
        .setTitle(`Application : ${this.server.name}`)
        .setTimestamp(this.submitted_at)
        .setFooter({text: `Application ${String(this._id)} | The Illumindal Guild`, iconURL: "https://autumnsdawn.net/assets/images/icons/illumindal_120px.png"});

    if (this.discordUser) {
        embed.setAuthor({name: this.discordUser?.globalName ? this.discordUser.globalName : this.discordUser.username, iconURL: this.discordUser.avatarUrl()});
        embed.addFields({
            name: "Discord User",
            value: `${this.discordUser?.globalName ? this.discordUser.globalName : this.discordUser.username}${codeBlock(this.discordUser._id)}<@${this.discordUser._id}>`,
            inline: true,
        })
    }
    if (this.twitchUser) {
        embed.addFields({
            name: "Twitch User",
            value: `${this.twitchUser.display_name}${codeBlock(this.twitchUser._id)}[Profile](https://twitch.tv/${this.twitchUser.login})`,
            inline: true,
        })
    }
    if (this.steamUser) {
        embed.addFields({
            name: "Steam User",
            value: `${this.steamUser.username}${codeBlock(this.steamUser._id)}[Profile](${this.steamUser.profile})`,
            inline: true,
        })
    }

    values.forEach((value, i) => {
        embed.addFields({
            name: "Multiple Choice #" + (i + 1),
            value: value.input.label + codeBlock(cleanCodeBlockContent(String(value.text ? value.text : value.number))),
            inline: false,
        });
    });

    return embed;
}

module.exports = mongoose.model("Application", schema);
