const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    twitchUser: {
        type: String,
        ref: "TwitchUser",
        required: true,
    },
    discordUser: {
        type: String,
        ref: "DiscordUser",
        required: true,
    },
    discordChannel: {
        type: String,
        required: true,
    },
    roleMention: {
        type: String,
        default: "",
    },
});

module.exports = mongoose.model("EnvoyListener", schema);
