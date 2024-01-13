const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    server: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Server",
        required: true,
    },
    channelType: {
        type: String,
        enum: ["announcement","chat"],
    },
    channel: {
        type: String,
        required: true,
    },
});

schema.methods.getChannel = function() {
    return global.discord.channels.fetch(this.channel);
}

module.exports = mongoose.model("ServerChannel", schema);
