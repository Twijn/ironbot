const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    channel: String,
    channelName: String,
    identity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Identity",
        index: true,
    },
    startTime: Date,
    endTime: Date,
});

module.exports = mongoose.model("DiscordVoiceLog", schema);
