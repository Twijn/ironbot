const mongoose = require("mongoose");
const { EmbedBuilder, codeBlock, cleanCodeBlockContent } = require("discord.js");

const ApplicationValue = require("./ApplicationValue");

const DiscordMessage = require("./DiscordMessage");
const ServerChannel = require("./ServerChannel");

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
    denyReason: {
        userFacing: String,
        operatorFacing: String,
    },
});

schema.methods.getValues = function() {
    return ApplicationValue.find({application: this})
        .populate(["application","input"]);
}

schema.methods.createEmbed = async function() {
    const values = await this.getValues();

    let color = 0xcf7b2d;

    if (this.accepted) {
        color = 0x2dce3d;
    } else if (this?.denyReason?.userFacing) {
        color = 0xd63939;
    }

    const embed = new EmbedBuilder()
        .setColor(color)
        .setThumbnail(this.server.imageUrl)
        .setTitle(`Application : ${this.server.name}`)
        .setTimestamp(this.submitted_at)
        .setFooter({text: `${String(this._id)} | The Illumindal Guild`, iconURL: "https://autumnsdawn.net/assets/images/icons/illumindal_120px.png"});

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

schema.methods.accept = async function() {
    if (this.accepted) {
        throw "This application has already been accepted!";
    }

    if (this?.denyReason?.userFacing) {
        throw "This application has already been denied!";
    }

    let member;
    try {
        member = await global.utils.guild.members.fetch(this.discordUser._id);
    } catch(err) {}

    if (!member) {
        throw "Unable to accept application as the member is not in the Guild!";
    }

    this.accepted = true;
    await this.save();

    const discordMessages = await DiscordMessage.find({application: this});

    const embed = await this.createEmbed();

    // Update message embeds
    for (let i = 0; i < discordMessages.length; i++) {
        try {
            const message = await discordMessages[i].getMessage();
            message.edit({content: "", embeds: [embed], components: []})
                .catch(console.error);
        } catch(err) {
            console.error(err);
        }
    }

    // Assign user role
    if (this.server.role) {
        member.roles.add(this.server.role).catch(console.error);
    }

    let passwordNeedsSent = false;

    if (this.server.joinPassword) {
        passwordNeedsSent = true;
        try {
            await member.send(`The password to join the **${this.server.name}** server is: ${codeBlock(cleanCodeBlockContent(this.server.joinPassword))}Please keep this password safe!`);
            passwordNeedsSent = false;
        } catch(err) {
            console.error(err);
        }
    }

    // Send join message
    const chatChannels = await ServerChannel.find({server: this.server, channelType: "chat"});
    if (chatChannels.length > 0) {
        chatChannels[0].getChannel().then(channel => {
            const embed = new EmbedBuilder()
                .setTitle("A new Adventurer has arrived!")
                .setAuthor({name: this.discordUser.globalName ? this.discordUser.globalName : this.discordUser.username, iconURL: this.discordUser.avatarUrl()})
                .setColor(0xbd5e11)
                .setDescription(
                    `Everyone, welcome <@${this.discordUser._id}> to the \`${this.server.name}\` server!` +
                    (passwordNeedsSent ? `\nWe were unable to DM you the server password! Please ask <@${this.server.operator}> for the password.` : "")
                )
                .setFooter({text: `The Illumindal Guild`, iconURL: "https://autumnsdawn.net/assets/images/icons/illumindal_120px.png"});

            if (this.server.joinInstructionsUrl) {
                embed.addFields({
                    name: "Joining Instructions",
                    value: `[Please click here to view joining instructions for the server](${this.server.joinInstructionsUrl})`,
                    inline: false,
                })
            }

            if (this.server.imageUrl) {
                embed.setThumbnail(this.server.imageUrl);
            }

            channel.send({embeds: [embed], content: `<@${this.discordUser._id}>`});
        }, console.error);
    }
}

schema.methods.deny = async function(reasonUser, reasonOperator) {
    if (this.accepted) {
        throw "This application has already been accepted!";
    }

    if (this?.denyReason?.userFacing) {
        throw "This application has already been denied!";
    }

    if (!reasonOperator || reasonOperator === "") {
        reasonOperator = reasonUser;
    }

    let member;
    try {
        member = await global.utils.guild.members.fetch(this.discordUser._id);
    } catch(err) {}

    if (!member) {
        throw "Unable to deny application as the member is not in the Guild!";
    }

    this.denyReason.userFacing = reasonUser;
    this.denyReason.operatorFacing = reasonOperator;
    await this.save();

    const discordMessages = await DiscordMessage.find({application: this});

    const embed = await this.createEmbed();

    // Update message embeds
    for (let i = 0; i < discordMessages.length; i++) {
        try {
            const message = await discordMessages[i].getMessage();
            message.edit({content: "", embeds: [embed], components: []})
                .catch(console.error);
        } catch(err) {
            console.error(err);
        }
    }

    try {
        await member.send(`Your application to join the \`${this.server.name}\` server was denied! Reason: ${codeBlock(cleanCodeBlockContent(reasonUser))}`);
    } catch(err) {
        throw `The application was successfully denied, however we were unable to message the member regarding the denial.\nPlease manually inform them of the reason for denial:${codeBlock(cleanCodeBlockContent(reasonUser))}`;
    }
}

module.exports = mongoose.model("Application", schema);
