const express = require("express");
const router = express.Router();

const utils = require("../../utils");

router.get("/", async (req, res) => {
    const finalMembers = [];
    const membersByRole = await utils.MemberManager.getMembersByRole(true);

    for (let i = 0; i < membersByRole.length; i++) {
        let members = [];
        for (let x = 0; x < membersByRole[i].members.length; x++) {
            members.push(await membersByRole[i].members[x].identity.getProfile());
        }
        finalMembers.push({
            role: membersByRole[i].role,
            members,
        });
    }

    res.render("pages/members", {
        members: finalMembers,
        twitchUsers: req.twitchUsers,
        discordUsers: req.discordUsers,
        identity: req?.session?.identity,
    });
});

module.exports = router;
