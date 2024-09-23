const express = require("express");
const router = express.Router();

router.get("/discord", (req, res) => {
    res.redirect("https://discord.gg/UnuZeRj9An");
});

router.get("/guilded", (req, res) => {
    res.redirect("https://www.guilded.gg/i/kX11Wolp");
});

router.get("/twitch", (req, res) => {
    res.redirect("https://twitch.tv/ivironenochxii");
});

router.get("/youtube", (req, res) => {
    res.redirect("https://www.youtube.com/channel/UCm5e-c7pNc2rf5DRANKBe1Q");
});

router.get("/x", (req, res) => {
    res.redirect("https://twitter.com/IllumindalGuild");
});

module.exports = router;
