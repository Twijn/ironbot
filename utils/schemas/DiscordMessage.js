const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String,
    channel: String,
    identity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Identity",
        index: true,
    },
    stream: {
        type: String,
        ref: "TwitchStream",
    },
    event: {
        type: String,
        ref: "Event",
    },
    contentLength: Number,
    hasAttachments: Boolean,
});

schema.methods.getMessage = function() {
    return new Promise((resolve, reject) => {
        global.discord.channels.fetch(this.channel).then(channel => {
            channel.messages.fetch(this._id).then(resolve, reject);
        }, reject);
    });
}

module.exports = mongoose.model("DiscordMessage", schema);
