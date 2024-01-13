const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
        required: true,
        index: true,
    },
    input: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ApplicationInput",
        required: true,
    },
    number: Number,
    text: String,
});

module.exports = mongoose.model("ApplicationValue", schema);
