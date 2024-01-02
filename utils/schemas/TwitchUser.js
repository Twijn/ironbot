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

schema.methods.updateData = async function(updateFollowers = true) {
    let helixUser = await global.utils.Twitch.raw.users.getUserByIdBatched(this._id);

    if (helixUser) {
        if (updateFollowers) {
            const followers = await global.utils.Twitch.raw.channels.getChannelFollowerCount(this._id);
            
            if (followers) {
                this.follower_count = followers;
            }
        }
    
        this.login = helixUser.name;
        this.display_name = helixUser.displayName;
        this.type = helixUser.type;
        this.broadcaster_type = helixUser.broadcasterType;
        this.description = helixUser.description;
        this.profile_image_url = helixUser.profilePictureUrl;
        this.offline_image_url = helixUser.offlinePlaceholderUrl;
    }

    this.updated_at = Date.now();
    await this.save();

    return this;
}

module.exports = mongoose.model("TwitchUser", schema);
