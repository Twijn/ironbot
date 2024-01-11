const mongoose = require("mongoose");

const ApplicationForm = require("./ApplicationForm");
const ApplicationFormInput = require("./ApplicationFormInput");
const ApplicationInput = require("./ApplicationInput");

const EnvoyListener = require("./EnvoyListener");

const DiscordMessage = require("./DiscordMessage");
const DiscordToken = require("./DiscordToken");
const DiscordUser = require("./DiscordUser");

const Identity = require("./Identity");
const Session = require("./Session");

const Server = require("./Server");
const SteamUser = require("./SteamUser");

const TwitchToken = require("./TwitchToken");
const TwitchUser = require("./TwitchUser");

const TwitchGame = require("./TwitchGame");
const TwitchStream = require("./TwitchStream");
const TwitchStreamStatus = require("./TwitchStreamStatus");

const config = require("../../config.json");

class Schemas {

    ApplicationForm = ApplicationForm;
    ApplicationFormInput = ApplicationFormInput;
    ApplicationInput = ApplicationInput;

    EnvoyListener = EnvoyListener;

    DiscordMessage = DiscordMessage;
    DiscordToken = DiscordToken;
    DiscordUser = DiscordUser;

    Identity = Identity;
    Session = Session;

    Server = Server;
    SteamUser = SteamUser;

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
