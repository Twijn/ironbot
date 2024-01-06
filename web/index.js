const express = require("express");
const path = require("path");
const app = express();

const utils = require("../utils/");
const config = require("../config.json");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static("web/static"));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const authCache = {};
app.use(async (req, res, next) => {
    req.session = null;
    req.twitchUsers = [];
    req.discordUsers = [];
    if (req?.cookies?.isession) {
        if (authCache.hasOwnProperty(req.cookies.isession)) {
            req.session = authCache[req.cookies.isession];
            if (req.session.expires_at < Date.now()) {
                req.session = null;
                delete authCache[req.cookies.isession];
            }
        } else {
            try {
                req.session = await utils.Schemas.Session.findById(req.cookies.isession)
                    .populate("identity");
    
                if (req.session) {
                    req.twitchUsers = await req.session.identity.getTwitchUsers();
                    req.discordUsers = await req.session.identity.getDiscordUsers();
                    
                    authCache[req.session._id] = req.session;
                }
            } catch(err) {
                console.error(err);
            }
        }
    }
    next();
});

const controllers = require("./controllers");
app.use("/", controllers);

app.get("/discord", (req, res) => {
    res.redirect("https://discord.gg/UnuZeRj9An");
});

app.get("/guilded", (req, res) => {
    res.redirect("https://www.guilded.gg/i/kX11Wolp");
});

app.get("/twitch", (req, res) => {
    res.redirect("https://twitch.tv/ivironenochxii");
});

app.get("/x", (req, res) => {
    res.redirect("https://twitter.com/IVIronEnochXII");
});


app.listen(config.web.port, () => {
    console.log("Express has been opened on " + config.web.port);
});
