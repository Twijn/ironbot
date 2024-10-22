const express = require("express");
const path = require("path");
const app = express();

const utils = require("../utils/");
const config = require("../config.json");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(async (req, res, next) => {
    req.session = null;
    req.twitchUsers = [];
    req.discordUsers = [];
    req.steamUsers = [];

    if (req?.cookies?.isession) {
        utils.CacheManager.session.get(req.cookies.isession, async (resolve, reject) => {
            try {
                const session = await utils.Schemas.Session.findById(req.cookies.isession)
                    .populate("identity");

                if (session?.identity?._id) {
                    resolve({
                        session,
                        twitchUsers: await session.identity.getTwitchUsers(),
                        discordUsers: await session.identity.getDiscordUsers(),
                        steamUsers: await session.identity.getSteamUsers(),
                    });
                } else {
                    reject("Session not found");
                }
            } catch(err) {
                reject(err);
            }
        }, false, false).then(session => {
            req.session = session.session;
            req.twitchUsers = session.twitchUsers;
            req.discordUsers = session.discordUsers;
            req.steamUsers = session.steamUsers;
            if (req.session.expires_at < Date.now()) {
                req.session = null;
                utils.CacheManager.session.remove(req.cookies.isession);
            }
            next();
        }, err => {
            if (err !== "Session not found") {
                console.error("Failed to retrieve session", err);
            }
            next();
        });
    } else {
        next();
    }

    req.clearSessionCache = function() {
        if (!req?.cookies?.isession) return;

        utils.CacheManager.session.remove(req?.cookies?.isession);
    }
});

const controllers = require("./controllers");
app.use("/", controllers);

app.use(require("./controllers/cachePolicy"));

const shortcuts = require("./shortcuts");
app.use("/", shortcuts);

app.use(express.static("web/static"));

// 404 handler
app.use((req, res) => {
    res.status(404).render("pages/errors/404", {
        discordUsers: req.discordUsers,
    })
});

app.listen(config.web.port, () => {
    console.log("Express has been opened on " + config.web.port);
});
