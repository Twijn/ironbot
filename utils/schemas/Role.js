const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String,
    display: {
        type: Boolean,
        default: true,
    },
    position: {
        type: Number,
        min: 0,
        max: 10,
    },
    name: String,
    description: String,
});

module.exports = mongoose.model("Role", schema);
