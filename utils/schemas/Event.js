const { EmbedBuilder, codeBlock, cleanCodeBlockContent } = require("discord.js");
const mongoose = require("mongoose");

const config = require("../../config.json");

const schema = new mongoose.Schema({
    _id: {
        type: String,
    },
    channel: String,
    creator: {
        type: String,
        required: true,
        ref: "DiscordUser",
    },
    name: String,
    description: String,
    url: String,
    coverUrl: String,
    startTime: Date,
    endTime: Date,
    cancelled: {
        type: Boolean,
        default: false,
    },
});

schema.methods.createEmbed = function() {
    const embed = new EmbedBuilder()
        .setColor(0x525ee6)
        .setTitle("New Event Posted!")
        .setDescription(`<@&${config.discord.roles.events.news}>, a new event has been posted!`)
        .setAuthor({name: this.creator.globalName ? this.creator.globalName : this.creator.username, iconURL: this.creator.avatarUrl()})
        .setFooter({text: "The Illumindal Guild", iconURL: "https://autumnsdawn.net/assets/images/icons/illumindal_120px.png"})
        .setTimestamp(this.startTime)
        .setFields(
            {
                name: "Event Name",
                value: `\`${this.name.replace("`","\\`")}\``,
                inline: true,
            },
            {
                name: "Start Time",
                value: `<t:${Math.floor(this.startTime/1000)}:f>\n<t:${Math.floor(this.startTime/1000)}:R>`,
                inline: true,
            },
        );

    if (this.endTime) {
        embed.addFields({
                name: "End Time",
                value: `<t:${Math.floor(this.endTime/1000)}:f>\n<t:${Math.floor(this.endTime/1000)}:R>`,
                inline: true,
            });
    }

    if (this.description && this.description.length > 0) {
        embed.addFields({
            name: "Event Description",
            value: codeBlock(cleanCodeBlockContent(this.description)),
            inline: false,
        })
    }

    return embed;
}

schema.methods.getMentions = function() {
    let mentions = [config.discord.roles.events.news];

    for (let i = 0; i < config.discord.roles.events.keywords.length; i++) {
        const keyword = config.discord.roles.events.keywords[i];
        for (let k = 0; k < keyword.keywords.length; k++) {
            if (this.name.toLowerCase().includes(keyword.keywords[k].toLowerCase())
                || this.description.toLowerCase().includes(keyword.keywords[k].toLowerCase())) {
                mentions.push(keyword.role);
                break;
            }
        }
    }

    return mentions.map(x => `<@&${x}>`).join(" ");
}

module.exports = mongoose.model("Event", schema);
