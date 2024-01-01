const mongoose = require("mongoose");

const DiscordMessage = require("./DiscordMessage");

const TwitchStreamStatus = require("./TwitchStreamStatus");

const schema = new mongoose.Schema({
    _id: String,
    startDate: {
        type: Date,
        default: Date.now,
    },
    endDate: {
        type: Date,
        default: null,
    },
    channel: {
        type: String,
        ref: "TwitchUser",
        required: true,
        index: true,
    }
});

schema.methods.getMessages = function() {
    return new Promise((resolve, reject) => {
        DiscordMessage.find({stream: this._id}).then(async messages => {
            let dMessages = [];
            for (let i = 0; i < messages.length; i++) {
                try {
                    dMessages.push(await messages[i].getMessage());
                } catch(err) {
                    console.error(err);
                }
            }
            resolve(dMessages);
        }, reject);
    });
}

schema.methods.getStats = async function() {
    const stats = (await TwitchStreamStatus.aggregate([
        {
            $match: {
                stream: this._id,
            },
        },
        {
            $group: {
                _id: null,
                minViewers: {
                    $min: "$viewers",
                },
                maxViewers: {
                    $max: "$viewers",
                },
                avgViewers: {
                    $avg: "$viewers",
                },
            },
        }
    ]))[0];

    return {
        secondsElapsed: Math.floor((this.endDate - this.startDate) / 1000),
        viewers: {
            min: stats.minViewers,
            max: stats.maxViewers,
            avg: stats.avgViewers,
        },
    };
}

module.exports = mongoose.model("TwitchStream", schema);
