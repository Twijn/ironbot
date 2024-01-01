const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String,
    name: String,
    boxArtUrl: String,
});

module.exports = mongoose.model("TwitchGame", schema);
