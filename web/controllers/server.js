const express = require("express");
const router = express.Router();

const utils = require("../../utils/");

router.get("/", (req, res) => {
    res.redirect("/");
});

router.get("/:id", async (req, res) => {
    const server = utils.servers.find(x => String(x._id) === req.params.id);

    const applicableServers = utils.servers.filter(x => x.form?._id);

    if (!server) {
        return res.redirect("/");
    }

    res.render("pages/server", {
        server,
        applicableServers,
        discordUsers: req.discordUsers,
        steamUsers: req.steamUsers,
        twitchUsers: req.twitchUsers,
    });
});

module.exports = router;
