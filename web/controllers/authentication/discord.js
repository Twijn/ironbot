const express = require("express");
const router = express.Router();

const utils = require("../../../utils/");

router.get("/", async (req, res) => {
    if (!req.session?.identity?._id) {
        return res.redirect("/auth/twitch");
    }

    const twitchUsers = await req.session.identity.getTwitchUsers();

    if (twitchUsers.length === 0) {
        return res.redirect("/auth/twitch");
    }

    if (!req.query?.code) {
        return res.redirect(utils.Discord.generateOAuthLink(twitchUsers[0]._id));
    }

    if (!req.query?.state || req.query.state !== twitchUsers[0]._id) {
        return res.send(`You may have been session jacked! <a href="/auth/discord">Click here to try again.</a>`);
    }

    utils.Discord.Authentication.getToken(req.query.code).then(token => {
        utils.Discord.Authentication.getUser(token.access_token, token.token_type).then(async userData => {
            const user = await utils.Discord.getUserById(userData.id, false, true);

            if (user.identity?._id && req.session.identity?._id && user.identity._id !== req.session.identity._id) {
                return res.send("Error! The Discord user you logged in with and the session you are using has differing identities. Try logging out and retrying your request, or ask Twijn for support.");
            }

            user.identity = req.session.identity;
            await user.save();

            res.redirect("/");

            utils.Schemas.DiscordToken.findByIdAndUpdate({
                user: user._id,
            }, {
                user: user._id,
                tokenData: token,
            }).catch(console.error);
        }, err => {
            console.error(err);
            res.redirect(utils.Discord.generateOAuthLink(twitchUsers[0]._id));
        })
    }, err => {
        console.error(err);
        res.redirect(utils.Discord.generateOAuthLink(twitchUsers[0]._id));
    });
});

module.exports = router;
