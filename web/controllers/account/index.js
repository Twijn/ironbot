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

router.get("/card/:identityid", async (req, res) => {
    try {
        const identity = await utils.Schemas.Identity.findById(req.params.identityid);
        const cardCanvas = await identity.generateCard();

        res.writeHead(200, {
            "Content-Type": "image/png",
        });

        res.end(cardCanvas.toBuffer("image/png"));
    } catch(err) {
        console.log(err);
        res.status(404);
        res.send("Unable to find identity!");
    }
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
