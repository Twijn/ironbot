const express = require("express");
const path = require("path");
const app = express();

const utils = require("../utils/");
const config = require("../config.json");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const authCache = {};
app.use(async (req, res, next) => {
    req.session = null;
    req.twitchUsers = [];
    req.discordUsers = [];
    req.steamUsers = [];
    if (req?.cookies?.isession) {
        if (authCache.hasOwnProperty(req.cookies.isession)) {
            req.session = authCache[req.cookies.isession].session;
            req.twitchUsers = authCache[req.cookies.isession].twitchUsers;
            req.discordUsers = authCache[req.cookies.isession].discordUsers;
            req.steamUsers = authCache[req.cookies.isession].steamUsers;
            if (req.session.expires_at < Date.now()) {
                req.session = null;
                delete authCache[req.cookies.isession];
            }
        } else {
            try {
                req.session = await utils.Schemas.Session.findById(req.cookies.isession)
                    .populate("identity");
    
                if (req.session?.identity?._id) {
                    req.twitchUsers = await req.session.identity.getTwitchUsers();
                    req.discordUsers = await req.session.identity.getDiscordUsers();
                    req.steamUsers = await req.session.identity.getSteamUsers();
                    
                    authCache[req.session._id] = {
                        session: req.session,
                        twitchUsers: req.twitchUsers,
                        discordUsers: req.discordUsers,
                        steamUsers: req.steamUsers,
                    };
                } else {
                    req.session = null;
                }
            } catch(err) {
                console.error(err);
            }
        }
    }

    req.clearSessionCache = function() {
        delete authCache[req.cookies.isession];
    }

    next();
});

const controllers = require("./controllers");
app.use("/", controllers);

app.use(require("./controllers/cachePolicy"));

const shortcuts = require("./shortcuts");
app.use("/", shortcuts);

app.use(express.static("web/static"));

app.listen(config.web.port, () => {
    console.log("Express has been opened on " + config.web.port);
});
