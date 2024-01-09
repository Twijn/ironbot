const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    requireDiscord: {
        type: Boolean,
        default: false,
    },
    requireTwitch: {
        type: Boolean,
        default: false,
    },
    requireSteam: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("ApplicationForm", schema);
