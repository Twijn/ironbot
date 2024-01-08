const express = require("express");
const router = express.Router();

const utils = require("../../utils/");
const { ActionRowBuilder, EmbedBuilder, codeBlock, ButtonBuilder } = require("@discordjs/builders");
const { cleanCodeBlockContent, ButtonStyle } = require("discord.js");

const MINIMUM_REQUEST_TIME = 10 * 60 * 1000;

const auth = require("./authentication/");

router.use("/auth", auth);

router.get("/", (req, res) => {
    let envoys = [];

    const listeners = utils.EnvoyListenerManager.getAllListeners();
    listeners.forEach(listener => {
        if (!envoys.find(x => x.twitchUser._id === listener.twitchUser._id)) {
            envoys.push(listener);
        }
    });

    res.render("pages/index", {
        envoys,
        servers: utils.servers,
        comma: utils.comma,
        twitchUsers: req.twitchUsers,
        discordUsers: req.discordUsers,
    });
});

router.get("/map", (req, res) => {
    res.render("pages/map", {
        success: Boolean(req.query?.success),
        error: req.query?.error ? req.query.error : null,
        twitchUsers: req.twitchUsers,
        discordUsers: req.discordUsers,
    });
});

router.use((req, res, next) => {
    if (!req?.session?.identity?._id) {
        res.cookie("return_uri", "/account");
        res.redirect("/auth/discord");
    } else
        next();
});

const account = require("./account/");
router.use("/account", account);

router.use(express.urlencoded({extended: false}));

let previousRequests = [];

router.post("/map", (req, res) => {
    const ip = req.headers.hasOwnProperty("cf-connecting-ip") ? req.headers["cf-connecting-ip"] : req.ip;

    if (!ip) {
        return res.redirect(`/map?error=${encodeURIComponent("Unable to request location addition: Invalid IP")}`);
    }

    if (previousRequests.find(x => x.ip === ip && Date.now() - x.time <= MINIMUM_REQUEST_TIME)) {
        return res.redirect(`/map?error=${encodeURIComponent("You must wait to request another location!")}`);
    }

    if (req.discordUsers.length === 0) {
        return res.redirect(`/map?error=${encodeURIComponent("You must be logged in and have one Discord user linked!")}`);
    }

    if (!req.body?.location) {
        return res.redirect(`/map?error=${encodeURIComponent("Invalid location!")}`);
    }

    const embed = new EmbedBuilder()
        .setColor(0xbd5e11)
        .setTitle("Location Request")
        .setDescription(`A new location request was received from \`${ip}\``)
        .addFields({
            name: "User",
            value: `<@${req.discordUsers[0]._id}>${req.twitchUsers.length > 0 ? codeBlock(req.twitchUsers[0].display_name) : ""}`,
            inline: true,
        }, {
            name: "Location",
            value: codeBlock(cleanCodeBlockContent(req.body.location)),
            inline: true,
        });

    const button = new ButtonBuilder()
        .setCustomId("complete-request")
        .setLabel("Complete Request")
        .setStyle(ButtonStyle.Success);

    utils.channels.locationRequest.send({embeds: [embed], components: [
        new ActionRowBuilder()
            .addComponents(button)
    ]}).then(msg => {
        previousRequests.push({
            ip,
            time: Date.now(),
        });
        res.redirect("/map?success=true");
    }, err => {
        console.error(err);
        res.redirect(`/map?error=${encodeURIComponent("Failed to send notification! Try again, and report this if the error continues.")}`);
    });
});

module.exports = router;
