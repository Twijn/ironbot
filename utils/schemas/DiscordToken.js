const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    user: {
        type: String,
        ref: "DiscordUser",
        index: true,
    },
    tokenData: {
        token_type: String,
        access_token: String,
        expires_in: Number,
        refresh_token: String,
        scope: String,
    },
});

module.exports = mongoose.model("DiscordToken", schema);
