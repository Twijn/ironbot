const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String,
    channel: String,
    stream: {
        type: String,
        ref: "TwitchStream",
    },
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
    },
});

schema.methods.getMessage = function() {
    return new Promise((resolve, reject) => {
        global.discord.channels.fetch(this.channel).then(channel => {
            channel.messages.fetch(this._id).then(resolve, reject);
        }, reject);
    });
}

module.exports = mongoose.model("DiscordMessage", schema);
