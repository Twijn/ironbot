const express = require("express");
const router = express.Router();

const utils = require("../../utils/");

router.get("/", async (req, res) => {
    if (!req?.query?.server) {
        return res.redirect(`/?error=${encodeURIComponent("No servers given")}`);
    }

    let servers = req.query.server;
    if (typeof(servers) === "string") {
        servers = [servers];
    }

    servers = servers.map(x => utils.servers.find(y => x === String(y._id)));

    let requireDiscord = false;
    let requireSteam = false;
    let requireTwitch = false;
    
    for (let i = 0; i < servers.length; i++) {
        const server = servers[i];
        if (!server?.form?._id) {
            return res.redirect(`/?error=${encodeURIComponent("Invalid server ID given")}`);
        }
        requireDiscord = requireDiscord || server.form.requireDiscord;
        requireSteam = requireSteam || server.form.requireSteam;
        requireTwitch = requireTwitch || server.form.requireTwitch;
    }

    const inputs = await utils.Schemas.ApplicationInput.find({form: {$in: servers.map(x => x.form)}});

    res.render("pages/apply", {
        requireDiscord,
        requireSteam,
        requireTwitch,
        servers,
        inputs,
        discordUsers: req.discordUsers,
        steamUsers: req.steamUsers,
        twitchUsers: req.twitchUsers,
    });
});

router.use(express.urlencoded({extended: false}));

router.post("/", (req, res) => {
    console.log(req.body);
    res.send("nyi");
});

module.exports = router;
