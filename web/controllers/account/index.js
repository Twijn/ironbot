const express = require("express");
const router = express.Router();

const utils = require("../../../utils/");

router.get("/", (req, res) => {
    res.render("pages/account/index", {
        discordUsers: req.discordUsers,
        steamUsers: req.steamUsers,
        twitchUsers: req.twitchUsers,
    });
});

router.post("/join", async (req, res) => {
    if (req.discordUsers.length === 0) {
        return res.json({ok: false, error: "Not logged in!"});
    }

    for (let i = 0; i < req.discordUsers.length; i++) {
        const user = req.discordUsers[i];
        try {
            await user.joinDiscord();
            res.json({ok:true});
        } catch(error) {
            res.json({ok:false,error});
        }
    }
});

module.exports = router;
