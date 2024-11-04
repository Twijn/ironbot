const express = require("express");
const router = express.Router();

const utils = require("../../utils");

router.get("/", async (req, res) => {
    res.render("pages/members", {
        members: await utils.MemberManager.getMembersByRole(true),
        twitchUsers: req.twitchUsers,
        discordUsers: req.discordUsers,
        identity: req?.session?.identity,
    });
});

module.exports = router;
