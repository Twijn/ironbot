const express = require("express");
const router = express.Router();

const utils = require("../../../utils/");
const config = require("../../../config.json");

router.get("/", async (req, res) => {
    const code = req?.query?.code;
    if (code) {
        try {
            const userId = await utils.Twitch.authProvider.addUserForCode(code);
            const user = await utils.Twitch.getUserById(userId, false, true);
            
            const accessToken = await utils.Twitch.authProvider.getAccessTokenForUser(user._id);
            await utils.Schemas.TwitchToken.findOneAndUpdate({
                user: user._id,
            }, {
                user: user._id,
                tokenData: accessToken,
            }, {
                upsert: true,
                new: true,
            });
            
            const identity = await user.createIdentity();

            const session = await utils.Schemas.Session.create({
                _id: utils.stringGenerator(64),
                identity,
            });

            res.cookie("isession", session._id, {
                expires: session.expires_at,
                path: "/",
                domain: config.web.cookie_domain,
                httpOnly: true,
                secure: true,
            });

            if ((await identity.getDiscordUsers()).length === 0) {
                res.redirect("/auth/discord");
            } else {
                if (req.cookies?.return_uri) {
                    res.redirect(req.cookies.return_uri)
                } else res.redirect("/");
            }
            return;
        } catch(err) {
            console.error(err);
        }
    }
    res.redirect(utils.Twitch.generateOAuthLink(["user:read:email","user:read:follows"]));
});

module.exports = router;
