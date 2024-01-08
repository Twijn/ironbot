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
        const token = await utils.Schemas.DiscordToken.findOne({user: user});
        if (token) {
            try {
                const newToken = await utils.Discord.Authentication.getAccessToken(token.tokenData.refresh_token);
                token.tokenData.refresh_token = newToken.refresh_token;
                token.tokenData.access_token = newToken.access_token;
                await token.save();

                utils.guild.members.add(user._id, {accessToken: newToken.access_token}).then(member => {
                    res.json({ok:true});
                }, err => {
                    console.error(err);
                    return res.json({ok: false, error: `Failed to add user to the guild!`});
                });
            } catch(err) {
                console.error(err);
                return res.json({ok: false, error: `Failed to refresh token for ${user.username}! Try logging in again.`});
            }
        } else {
            return res.json({ok: false, error: `Unable to find token for ${user.username}! Try logging in again.`});
        }
    }
});

module.exports = router;
