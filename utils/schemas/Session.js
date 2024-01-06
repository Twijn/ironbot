const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String,
    identity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Identity",
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    expires_at: {
        type: Date,
        default: () => Date.now() + (30 * 24 * 60 * 60 * 1000),
    },
});

module.exports = mongoose.model("Session", schema);
