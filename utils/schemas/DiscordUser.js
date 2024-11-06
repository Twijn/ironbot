const mongoose = require("mongoose");

const DiscordToken = require("./DiscordToken");

const schema = new mongoose.Schema({
    _id: {
        type: String,
    },
    username: String,
    globalName: String,
    identity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Identity",
        index: true,
        default: null,
    },
    discriminator: String,
    accentColor: String,
    avatar: String,
    bot: Boolean,
    joinedTimestamp: Date,
});

schema.methods.public = function() {
    return {
        id: this._id,
        username: this.username,
        identity: this?.identity?._id ? String(this.identity._id) : this.identity,
        discriminator: this.discriminator,
        avatarUrl: this.avatarUrl(),
    };
}

schema.methods.avatarUrl = function() {
    if (this.avatar) {
        return `https://cdn.discordapp.com/avatars/${this._id}/${this.avatar}.png`;
    } else {
        if (this.discriminator === "0") {
            return `https://cdn.discordapp.com/embed/avatars/${(BigInt(this._id) >> 22n) % 6n}.png`;
        } else {
            return `https://cdn.discordapp.com/embed/avatars/${Number(this.discriminator) % 5}.png`;
        }
    }
}

schema.methods.createIdentity = async function() {
    if (this.identity) {
        return this.identity;
    }

    this.identity = await global.utils.Schemas.Identity.create({});
    await this.save();

    return this.identity;
}

schema.methods.hasJoined = async function() {
    try {
        await global.utils.guild.members.fetch(this._id);
        return true;
    } catch(err) {
        return false;
    }
}

schema.methods.joinDiscord = function() {
    return new Promise(async (resolve, reject) => {
        const token = await DiscordToken.findOne({user: this});
        if (token) {
            try {
                const newToken = await global.utils.Discord.Authentication.getAccessToken(token.tokenData.refresh_token);
                token.tokenData.refresh_token = newToken.refresh_token;
                token.tokenData.access_token = newToken.access_token;
                await token.save();
    
                global.utils.guild.members.add(this._id, {accessToken: newToken.access_token}).then(member => {
                    resolve();
                }, err => {
                    console.error(err);
                    reject(`Failed to add user to the guild!`);
                });
            } catch(err) {
                console.error(err);
                reject(`Failed to refresh token for ${this.username}! Try logging in again.`);
            }
        } else {
            reject(`Unable to find token for ${this.username}! Try logging in again.`);
        }
    })
}

module.exports = mongoose.model("DiscordUser", schema);
