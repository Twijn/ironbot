const mongoose = require("mongoose");

const DiscordUser = require("./DiscordUser");
const SteamUser = require("./SteamUser");
const TwitchUser = require("./TwitchUser");

const schema = new mongoose.Schema({
    created_at: {
        type: Date,
        default: Date.now,
    },
});

schema.methods.getDiscordUsers = function() {
    return DiscordUser.find({identity: this}).populate("identity");
}

schema.methods.getSteamUsers = function() {
    return SteamUser.find({identity: this}).populate("identity");
}

schema.methods.getTwitchUsers = function() {
    return TwitchUser.find({identity: this}).populate("identity");
}

module.exports = mongoose.model("Identity", schema);
