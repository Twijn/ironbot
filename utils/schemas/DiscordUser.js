const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: {
        type: String,
    },
    username: String,
    displayName: String,
    discriminator: String,
    accentColor: String,
    avatar: String,
    bot: Boolean,
});

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

module.exports = mongoose.model("DiscordUser", schema);
