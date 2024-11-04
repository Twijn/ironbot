const express = require("express");
const router = express.Router();

const utils = require("../../utils/");

const auth = require("./authentication/");
const server = require("./server");

router.use("/auth", auth);
router.use("/server", server);

router.get("/", async (req, res) => {
    let envoys = [];

    const listeners = utils.EnvoyListenerManager.getAllListeners();
    listeners.forEach(listener => {
        if (!envoys.find(x => x.twitchUser._id === listener.twitchUser._id)) {
            envoys.push(listener);
        }
    });

    let hasJoined = true;
    for (let i = 0; i < req.discordUsers.length; i++) {
        if (!(await req.discordUsers[i].hasJoined())) {
            hasJoined = false;
        }
    }

    res.render("pages/index", {
        envoys,
        servers: utils.servers,
        hasJoined,
        comma: utils.comma,
        discordUsers: req.discordUsers,
        steamUsers: req.steamUsers,
        twitchUsers: req.twitchUsers,
    });
});

const map = require("./map");
router.use("/map", map);

const members = require("./members");
router.use("/members", members);

const requireAuth = (req, res, next) => {
    if (!req?.session?.identity?._id) {
        res.cookie("return_uri", req.path);
        res.redirect("/auth/discord");
    } else
        next();
};

const account = require("./account/");
router.use("/account", requireAuth, account);

router.use(express.urlencoded({extended: false}));

module.exports = router;
