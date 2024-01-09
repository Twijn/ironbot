const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    form: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ApplicationForm",
        index: true,
    },
});

module.exports = mongoose.model("ApplicationInput", schema);
