const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: {
        type: String,
    },
    identity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Identity",
        index: true,
    },
    username: String,
    name: String,
    profile: String,
    avatar: {
        small: String,
        medium: String,
        large: String,
    },
});

module.exports = mongoose.model("SteamUser", schema);
