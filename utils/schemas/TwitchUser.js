const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: {
        type: String,
    },
    login: {
        type: String,
        minLength: 1,
        maxLength: 25,
        required: true,
        index: true,
    },
    display_name: {
        type: String,
        minLength: 1,
        maxLength: 25,
        required: true,
    },
    type: {
        type: String,
        enum: ["", "admin", "global_mod", "staff"],
        default: "",
    },
    broadcaster_type: {
        type: String,
        enum: ["", "affiliate", "partner"],
        default: "",
    },
    follower_count: Number,
    description: String,
    profile_image_url: String,
    offline_image_url: String,
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
        default: Date.now,
        required: true,
    },
    first_seen: {
        type: Date,
        default: Date.now,
        required: true,
    },
    last_seen: {
        type: Date,
        default: Date.now,
        required: true,
    },
});

module.exports = mongoose.model("TwitchUser", schema);
