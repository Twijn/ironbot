const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    stream: {
        type: String,
        ref: "TwitchStream",
        index: true,
    },
    game: {
        type: String,
        ref: "TwitchGame",
        index: true,
    },
    title: String,
    viewers: Number,
    date: {
        type: Date,
        default: Date.now,
        index: true,
    },
});

module.exports = mongoose.model("TwitchStreamStatus", schema);
