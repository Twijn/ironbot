const express = require("express");
const router = express.Router();

const utils = require("../../../utils/");
const config = require("../../../config.json");

router.get("/", async (req, res) => {
    if (!req.session?.identity?._id) {
        return res.redirect("/auth/discord");
    }

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

            user.identity = req.session.identity;
            await user.save();

            if (req.cookies?.return_uri) {
                res.cookie("return_uri", null, {
                    maxAge:-1000,
                    path: "/",
                    domain: config.web.cookie_domain,
                    httpOnly: true,
                    secure: true,
                });
                res.redirect(req.cookies.return_uri);
            } else res.redirect("/");

            console.log(`${user.identity._id} added twitch account ${user.display_name} (${user._id})`);

            req.clearSessionCache();
            return;
        } catch(err) {
            console.error(err);
        }
    }
    res.redirect(utils.Twitch.generateOAuthLink(["user:read:email","user:read:follows"]));
});

module.exports = router;
