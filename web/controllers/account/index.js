const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("pages/account/index", {
        discordUsers: req.discordUsers,
        steamUsers: req.steamUsers,
        twitchUsers: req.twitchUsers,
    });
});

module.exports = router;
