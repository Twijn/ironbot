const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    placeholder: String,
    type: {
        type: String,
        required: true,
        enum: ["text","number"],
    },
    required: {
        type: Boolean,
        required: true,
    },
    text: {
        minlength: Number,
        maxlength: Number,
    },
    number: {
        min: Number,
        max: Number,
        step: Number,
    }
});

module.exports = mongoose.model("ApplicationInput", schema);
