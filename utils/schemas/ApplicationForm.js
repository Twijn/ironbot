const mongoose = require("mongoose");

const ApplicationFormInput = require("./ApplicationFormInput");

const schema = new mongoose.Schema({
    requireDiscord: {
        type: Boolean,
        default: false,
    },
    requireTwitch: {
        type: Boolean,
        default: false,
    },
    requireSteam: {
        type: Boolean,
        default: false,
    },
});

schema.methods.getInputs = async function() {
    return (await ApplicationFormInput.find({form: this}).populate(["form","input"])).map(x => x.input);
}

module.exports = mongoose.model("ApplicationForm", schema);
