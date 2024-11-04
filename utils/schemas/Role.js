const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    roleId: {
        type: String,
        index: true,
    },
    display: {
        type: Boolean,
        default: true,
    },
    position: {
        type: Number,
        min: 1,
        max: 10,
    },
    name: String,
    description: String,
});

module.exports = mongoose.model("Role", schema);
