const mongoose = require("mongoose");
const { createCanvas, registerFont, loadImage, Image } = require("canvas");

const CacheManager = require("../cache/CacheManager");

const config = require("../../config.json");

registerFont("canvas/fonts/InknutAntiqua-Regular.ttf", {family: "Inknut Antiqua"});
registerFont("canvas/fonts/RobotoSlab-Regular.ttf", {family: "Roboto Slab"});

const DiscordUser = require("./DiscordUser");
const SteamUser = require("./SteamUser");
const TwitchUser = require("./TwitchUser");

const DiscordVoiceLog = require("./DiscordVoiceLog");
const DiscordMessage = require("./DiscordMessage");

const schema = new mongoose.Schema({
    created_at: {
        type: Date,
        default: Date.now,
    },
    biography: {
        type: String,
        maxLength: 100,
        default: null,
    },
    map: {
        name: {
            type: String,
            maxlength: 128,
        },
        country: String,
        countryCode: String,
        latlng: [Number],
    },
    merits: {
        type: Number,
        default: 0,
    },
    xp: {
        type: Number,
        default: 0,
    },
    friendCodes: {
        steam: {
            type: String,
            maxLength: 10,
            default: null,
        },
        switch: {
            type: String,
            maxLength: 17,
            default: null,
        },
    }
});

async function flushIdentity() {
    CacheManager.removeIdentity(this._id);
}

schema.pre("findOneAndUpdate", {document: true, query: false}, flushIdentity);
schema.pre("save", flushIdentity);

/**
 * @type {{discord:Image,steam:Image,switch:Image,twitch:Image}}
 */
let icons = {
    discord: null,
    steam: null,
    switch: null,
    twitch: null,
};

(async function() {
    icons = {
        discord: await loadImage("./canvas/icons/discord.png"),
        steam: await loadImage("./canvas/icons/steam.png"),
        switch: await loadImage("./canvas/icons/switch.png"),
        twitch: await loadImage("./canvas/icons/twitch.png"),
    };
})();

const getStartOfMonth = function() {
    const date = new Date();
    date.setDate(1);
    date.setHours(0,0,0,0);
    return date;
}

schema.methods.getMessageCount = async function(fromTime = null) {
    if (!fromTime) {
        fromTime = getStartOfMonth();
    }

    const messages = await DiscordMessage.find({
        identity: this,
        timestamp: {
            $gt: fromTime,
        },
        $or: [
            {hasAttachments: true},
            {contentLength: {$gt: 15}},
        ],
    });

    return messages.length;
}

schema.methods.getVCTime = async function(fromTime = null) {
    if (!fromTime) {
        fromTime = getStartOfMonth();
    }

    const voiceLogs = await DiscordVoiceLog.find({
        identity: this,
        startTime: {
            $gt: fromTime,
        },
    });

    let vcTime = 0;
    voiceLogs.forEach(log => {
        vcTime += log.endTime.getTime() - log.startTime.getTime();
    });
    vcTime = Math.floor(vcTime / 1000);

    return vcTime;
}

/**
 * Returns a month name from the number
 * @param {number} month 
 * @returns {string}
 */
const getMonth = month => {
    switch (month) {
        case 0:
            return "January";
        case 1:
            return "February";
        case 2:
            return "March";
        case 3:
            return "April";
        case 4:
            return "May";
        case 5:
            return "June";
        case 6:
            return "July";
        case 7:
            return "August";
        case 8:
            return "September";
        case 9:
            return "October";
        case 10:
            return "November";
        case 11:
            return "December";
        default:
            return "Invalid Month";
    }
}

/**
 * Returns a formatted date
 * @param {Date} date 
 * @return {string}
 */
const formatDate = date => {
    return `${getMonth(date.getMonth())} ${date.getDay()}, ${date.getFullYear()}`;
}

schema.methods.getDiscordUsers = function() {
    return DiscordUser.find({identity: this}).populate("identity");
}

schema.methods.getSteamUsers = function() {
    return SteamUser.find({identity: this}).populate("identity");
}

schema.methods.getTwitchUsers = function() {
    return TwitchUser.find({identity: this}).populate("identity");
}

schema.methods.generateCard = async function() {
    const startTime = Date.now();

    const discordUsers = await this.getDiscordUsers();

    if (discordUsers.length === 0) {
        throw "No discord users attached to this identity!";
    }

    const twitchUsers = await this.getTwitchUsers();
    const steamUsers = await this.getSteamUsers();

    const guild = await global.discord.guilds.fetch(config.discord.guild);
    const member = await guild.members.fetch(discordUsers[0]._id);

    let recognizedRole = null;

    if (!member) {
        throw "Unable to get the user's Discord membership in the guild!";
    }

    const roles = member.roles.cache;
    roles.forEach(role => {
        if (!recognizedRole && config.discord.roles.card.includes(role.id)) {
            recognizedRole = role;
        }
    });
    
    const width = 480;
    const height = 290;

    // create the canvas and get the context
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // set the background color
    ctx.fillStyle = "#252525";
    ctx.fillRect(0, 0, width, height);

    // variables
    const avatarSize = 128;
    const avatarOffsetX = 25;
    const avatarOffsetY = 20;
    const headSize = 36;
    const bodySize = 16;

    // create the top shade
    ctx.fillStyle = "#222222";
    ctx.fillRect(0,0, width, avatarSize + avatarOffsetY * 2);

    // create the bio bar
    ctx.fillStyle = "#bd5e11";
    ctx.fillRect(0, avatarSize + avatarOffsetY * 2, width, bodySize * 3 + 10);

    // draw orange line on left side
    ctx.fillStyle = "#9c4b09";
    ctx.fillRect(0, 0, 5, height);

    // retrieve the avatar and draw it
    ctx.beginPath();
    ctx.arc(
        avatarOffsetX + (avatarSize / 2),
        avatarOffsetY + (avatarSize / 2),
        avatarSize / 2,
        0, 2 * Math.PI
    );
    ctx.closePath();
    ctx.save();
    ctx.clip();

    const avatar = await loadImage(member.displayAvatarURL().replace(".webp", ".png"));
    ctx.drawImage(
        avatar,
        avatarOffsetX,
        avatarOffsetY,
        avatarSize,
        avatarSize
    );

    ctx.restore();

    // write the user's name
    ctx.fillStyle = "#ffffff";

    ctx.font = headSize + "px 'Inknut Antiqua'";

    const textBoxStart = avatarOffsetX * 2 + avatarSize;
    const textBoxMaxWidth = width - (avatarOffsetX * 3) - avatarSize - 5;

    let nextLine = avatarOffsetY + headSize;
    
    ctx.fillText(
        member.displayName,
        textBoxStart,
        nextLine,
        textBoxMaxWidth
    );

    nextLine += headSize - 5;

    ctx.font = bodySize + "px 'Roboto Slab'";

    if (recognizedRole) {
        const roleName = recognizedRole.name;
        const roleNameMeasure = ctx.measureText(roleName);
        let color = recognizedRole.hexColor;
        if (color === "#000000") color = "#ffffff";
        ctx.fillStyle = color;

        ctx.beginPath();
        ctx.roundRect(textBoxStart, nextLine - bodySize, roleNameMeasure.width + 10, bodySize + 10, 5);
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = "#000000";
        ctx.fillText(
            roleName,
            textBoxStart + 5,
            nextLine + 2.5,
            textBoxMaxWidth
        );

        nextLine += bodySize + 15;
    }

    ctx.fillStyle = "#f0f0f0";

    const joined = `Joined ${formatDate(member.joinedAt)}`;
    
    ctx.fillText(
        joined,
        textBoxStart,
        nextLine,
        textBoxMaxWidth
    )

    ctx.fillStyle = "#ffffff";

    let biography = this.biography ? this.biography : `${member.displayName} does not have a biography set!`;
    let bioLines = biography.split("\n").length;
    ctx.fillText(
        biography,
        avatarOffsetX,
        avatarSize + avatarOffsetY * 2 + bodySize + 2 + (bioLines === 2 ? 7 : bodySize),
        width - avatarOffsetX * 2
    );

    let newX = avatarOffsetX - 5;
    let newY = avatarSize + avatarOffsetY * 2 + bodySize * 2 + 40;

    /**
     * @param {Image} icon 
     * @param {string} userName 
     */
    const drawUser = (icon, userName) => {
        const imageWidth = bodySize * icon.width / icon.height;
        ctx.drawImage(icon, newX, newY, imageWidth, bodySize);
        newX += imageWidth + 5;
        ctx.fillText(
            userName, 
            newX,
            newY + bodySize - 3,
        );
        newX += ctx.measureText(userName).width + 14;
    }

    drawUser(icons.switch, `Code: ${this.friendCodes.switch ? this.friendCodes.switch : "None"}`);
    drawUser(icons.steam, `Code: ${this.friendCodes.steam ? this.friendCodes.steam : "None"}`);

    newX = avatarOffsetX - 5;
    newY += bodySize + 5;

    discordUsers.forEach(user => {
        drawUser(icons.discord, user.username);
    });

    twitchUsers.forEach(user => {
        drawUser(icons.twitch, user.display_name);
    });

    steamUsers.forEach(user => {
        drawUser(icons.steam, user.username)
    })

    console.log(`Generated card canvas for ${this._id} in ${Date.now() - startTime} ms`);
    
    return canvas;
}

module.exports = mongoose.model("Identity", schema);
