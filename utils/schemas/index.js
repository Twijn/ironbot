const mongoose = require("mongoose");

const EnvoyListener = require("./EnvoyListener");

const DiscordUser = require("./DiscordUser");
const DiscordMessage = require("./DiscordMessage");

const TwitchToken = require("./TwitchToken");
const TwitchUser = require("./TwitchUser");

const TwitchGame = require("./TwitchGame");
const TwitchStream = require("./TwitchStream");
const TwitchStreamStatus = require("./TwitchStreamStatus");

const config = require("../../config.json");

class Schemas {

    EnvoyListener = EnvoyListener;

    DiscordUser = DiscordUser;
    DiscordMessage = DiscordMessage;

    TwitchToken = TwitchToken;
    TwitchUser = TwitchUser;

    TwitchGame = TwitchGame;
    TwitchStream = TwitchStream;
    TwitchStreamStatus = TwitchStreamStatus;

    /**
     * Connects to mongoose
     */
    async connect() {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(config.mongodb.url);
        console.log("Connected to MongoDB!");
    }

    constructor() {
        this.connect().catch(console.error);
    }

}

module.exports = new Schemas();
