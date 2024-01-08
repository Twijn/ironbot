const express = require("express");
const router = express.Router();

const config = require("../../../config.json");
const utils = require("../../../utils/");

const SteamAuth = require("node-steam-openid");
const steam = new SteamAuth({
    realm: config.web.host,
    returnUrl: config.web.host + "auth/steam/authenticate",
    apiKey: config.steam.key,
});

router.get("/", async (req, res) => {
    if (!req.session?.identity?._id) {
        return res.redirect("/auth/twitch");
    }
    
    res.redirect(await steam.getRedirectUrl());
});

router.get("/authenticate", async (req, res) => {
    if (!req.session?.identity?._id) {
        return res.redirect("/auth/discord");
    }

    try {
        const user = await steam.authenticate(req);
        
        await utils.Schemas.SteamUser.findByIdAndUpdate(user.steamid, {
            _id: user.steamid,
            identity: req.session.identity,
            username: user.username,
            name: user.name,
            profile: user.profile,
            avatar: user.avatar,
        }, {
            upsert: true,
            new: true,
        });

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

        req.clearSessionCache();
    } catch(err) {
        console.error(err);
        res.send(`An error occurred! <a href="/auth/steam">Try again</a>`);
    }
});

module.exports = router;