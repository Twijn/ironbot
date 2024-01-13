const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    form: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ApplicationForm",
        index: true,
    },
    input: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ApplicationInput",
        index: true,
    },
});

module.exports = mongoose.model("ApplicationFormInput", schema);
