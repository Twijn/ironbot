const express = require("express");
const router = express.Router();

const config = require("../../../config.json");
const utils = require("../../../utils/");

router.get("/", async (req, res) => {
    if (!req.query?.code) {
        return res.redirect(utils.Discord.generateOAuthLink());
    }

    utils.Discord.Authentication.getToken(req.query.code).then(token => {
        utils.Discord.Authentication.getUser(token.access_token, token.token_type).then(async userData => {
            const user = await utils.Discord.getUserById(userData.id, false, true);
            
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
            
            if (userData.global_name)
                user.globalName = userData.global_name;
            await user.save();

            if (req.cookies?.return_uri) {
                res.cookie("return_uri", null, {
                    maxAge:-1000,
                    path: "/",
                    domain: config.web.cookie_domain,
                    httpOnly: true,
                    secure: true,
                });
                res.redirect(req.cookies.return_uri)
            } else res.redirect("/");

            req.clearSessionCache();

            console.log(`User ${user.username} (${user.id}) logged in`)

            utils.Schemas.DiscordToken.findOneAndUpdate({
                user: user._id
            }, {
                user: user._id,
                tokenData: token,
            }, {
                upsert: true,
                new: true,
            }).catch(console.error);
        }, err => {
            console.error(err);
            res.redirect(utils.Discord.generateOAuthLink());
        })
    }, err => {
        console.error(err);
        res.redirect(utils.Discord.generateOAuthLink());
    });
});

module.exports = router;
