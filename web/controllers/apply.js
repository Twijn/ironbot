const express = require("express");
const router = express.Router();

const utils = require("../../utils/");

router.get("/", async (req, res) => {
    let step = Number(req.query?.step ? req.query.step : 1);

    if (isNaN(step)) step = 1;

    if (step === 1) {
        let success = null;
        let error = null;
        if (req?.query?.success && req.query.success !== "") {
            success = req.query.success;
        }
        if (req?.query?.error && req.query.error !== "") {
            error = req.query.error;
        }
        return res.render("pages/apply/step1", {
            applicableServers: utils.servers.filter(x => x.form?._id),
            memberServers: await utils.getMemberServers(req.session.identity),
            discordUsers: req.discordUsers,
            steamUsers: req.steamUsers,
            twitchUsers: req.twitchUsers,
            success, error,
        });
    }

    if (!req?.query?.server) {
        return res.redirect(`/apply?error=${encodeURIComponent("No servers given")}`);
    }

    let servers = req.query.server;
    if (typeof(servers) === "string") {
        servers = [servers];
    }

    servers = servers.map(x => utils.servers.find(y => x === String(y._id)));

    let requireDiscord = false;
    let requireSteam = false;
    let requireTwitch = false;
    
    for (let i = 0; i < servers.length; i++) {
        const server = servers[i];
        if (!server?.form?._id) {
            return res.redirect(`/apply?error=${encodeURIComponent("Invalid server ID given")}`);
        }
        requireDiscord = requireDiscord || server.form.requireDiscord;
        requireSteam = requireSteam || server.form.requireSteam;
        requireTwitch = requireTwitch || server.form.requireTwitch;
    }

    if ((requireDiscord && req.discordUsers.length === 0) ||
        (requireTwitch && req.twitchUsers.length === 0) ||
        (requireSteam && req.steamUsers.length === 0)) {
        return res.render("pages/apply/missingAccounts", {
            servers,
            missingDiscord: (requireDiscord && req.discordUsers.length === 0),
            missingTwitch: (requireTwitch && req.twitchUsers.length === 0),
            missingSteam: (requireSteam && req.steamUsers.length === 0),
            discordUsers: req.discordUsers,
            steamUsers: req.steamUsers,
            twitchUsers: req.twitchUsers,
        });
    }

    if (step === 2) {
        return res.render("pages/apply/step2", {
            servers,
            discordUsers: req.discordUsers,
            steamUsers: req.steamUsers,
            twitchUsers: req.twitchUsers,
        });
    }

    if (step === 3) {
        return res.render("pages/apply/step3", {
            servers,
            requireDiscord,
            requireSteam,
            requireTwitch,
            discordUsers: req.discordUsers,
            steamUsers: req.steamUsers,
            twitchUsers: req.twitchUsers,
        });
    }

    let discordUser = null;
    let steamUser = null;
    let twitchUser = null;

    if (req.query?.discordUser) {
        discordUser = req.discordUsers.find(x => x._id === req.query.discordUser);
    }
    if (req.query?.steamUser) {
        steamUser = req.steamUsers.find(x => x._id === req.query.steamUser);
    }
    if (req.query?.twitchUser) {
        twitchUser = req.twitchUsers.find(x => x._id === req.query.twitchUser);
    }

    if (requireDiscord && !discordUser) {
        return res.redirect(`/apply?error=${encodeURIComponent("Missing Discord user")}`);
    }
    if (requireSteam && !steamUser) {
        return res.redirect(`/apply?error=${encodeURIComponent("Missing Steam user")}`);
    }
    if (requireTwitch && !twitchUser) {
        return res.redirect(`/apply?error=${encodeURIComponent("Missing Twitch user")}`);
    }

    const receivedInputs = await utils.Schemas.ApplicationFormInput.find({
        form: {
            $in: servers.map(x => x.form._id),
        },
    }).populate("input");

    let inputs = [];

    for (let i = 0; i < receivedInputs.length; i++) {
        const recInput = receivedInputs[i];
        const existingInput = inputs.find(x => x.input.name === recInput.input.name);

        if (existingInput) {
            existingInput.forms.push(recInput.form);
        } else {
            inputs.push({
                input: recInput.input,
                forms: [recInput.form],
            });
        }
    }

    let hasJoined = await discordUser.hasJoined();

    res.render("pages/apply/step4", {
        requireDiscord,
        requireSteam,
        requireTwitch,
        servers,
        discordUser,
        steamUser,
        twitchUser,
        hasJoined,
        inputs,
        discordUsers: req.discordUsers,
        steamUsers: req.steamUsers,
        twitchUsers: req.twitchUsers,
    });
});

router.use(express.urlencoded({extended: false}));

router.post("/", async (req, res) => {
    let servers = req.body.server;
    if (typeof(servers) === "string") {
        servers = [servers];
    }

    servers = servers.map(x => utils.servers.find(y => x === String(y._id)));

    let requireDiscord = false;
    let requireSteam = false;
    let requireTwitch = false;
    
    for (let i = 0; i < servers.length; i++) {
        const server = servers[i];
        if (!server?.form?._id) {
            return res.redirect(`/apply?error=${encodeURIComponent("Invalid server ID given")}`);
        }
        requireDiscord = requireDiscord || server.form.requireDiscord;
        requireSteam = requireSteam || server.form.requireSteam;
        requireTwitch = requireTwitch || server.form.requireTwitch;
    }

    let discordUser = null;
    let steamUser = null;
    let twitchUser = null;

    if (req.body?.discordUser) {
        discordUser = req.discordUsers.find(x => x._id === req.body.discordUser);
    }
    if (req.body?.steamUser) {
        steamUser = req.steamUsers.find(x => x._id === req.body.steamUser);
    }
    if (req.body?.twitchUser) {
        twitchUser = req.twitchUsers.find(x => x._id === req.body.twitchUser);
    }

    if (requireDiscord && !discordUser) {
        return res.redirect(`/apply?error=${encodeURIComponent("Missing Discord user")}`);
    }
    if (requireSteam && !steamUser) {
        return res.redirect(`/apply?error=${encodeURIComponent("Missing Steam user")}`);
    }
    if (requireTwitch && !twitchUser) {
        return res.redirect(`/apply?error=${encodeURIComponent("Missing Twitch user")}`);
    }

    req.body.discordUser = discordUser;
    req.body.steamUser = steamUser;
    req.body.twitchUser = twitchUser;

    let successes = 0;
    let errors = [];

    try {
        let hasJoined = await discordUser.hasJoined();

        if (!hasJoined) {
            await discordUser.joinDiscord();
        }
    } catch(err) {
        errors.push("Unable to invite user to Discord! Please join the server manually.");
        console.error(err);
    }

    for (let i = 0; i < servers.length; i++) {
        const server = servers[i];
        try {
            const application = await server.apply(req.session.identity, req.body);
            successes++
        } catch(err) {
            console.error(err);
            errors.push(String(err));
        };
    }

    res.redirect(`/apply?success=${successes > 0 ? encodeURIComponent(`Successfully applied to ${successes} server${successes === 1 ? "" : "s"}`) : ""}&error=${encodeURIComponent(errors.join("\n"))}`);
});

module.exports = router;
