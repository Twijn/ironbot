const mongoose = require("mongoose");

const EnvoyListener = require("./EnvoyListener");

const Event = require("./Event");

const Role = require("./Role");

const DiscordMessage = require("./DiscordMessage");
const DiscordToken = require("./DiscordToken");
const DiscordUser = require("./DiscordUser");
const DiscordVoiceLog = require("./DiscordVoiceLog");

const Identity = require("./Identity");
const Session = require("./Session");

const Server = require("./Server");
const ServerChannel = require("./ServerChannel");
const SteamUser = require("./SteamUser");

const TwitchToken = require("./TwitchToken");
const TwitchUser = require("./TwitchUser");

const TwitchGame = require("./TwitchGame");
const TwitchStream = require("./TwitchStream");
const TwitchStreamStatus = require("./TwitchStreamStatus");

const config = require("../../config.json");

class Schemas {

    EnvoyListener = EnvoyListener;

    Event = Event;

    Role = Role;

    DiscordMessage = DiscordMessage;
    DiscordToken = DiscordToken;
    DiscordUser = DiscordUser;
    DiscordVoiceLog = DiscordVoiceLog;

    Identity = Identity;
    Session = Session;

    Server = Server;
    ServerChannel = ServerChannel;
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
