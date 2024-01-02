const express = require("express");
const router = express.Router();

const utils = require("../../utils/");

router.get("/", (req, res) => {
    let envoys = [];

    const listeners = utils.EnvoyListenerManager.getAllListeners();
    listeners.forEach(listener => {
        if (!envoys.find(x => x.twitchUser._id === listener.twitchUser._id)) {
            envoys.push(listener);
        }
    });

    res.render("pages/index", {envoys, comma: utils.comma});
});

router.get("/map", (req, res) => {
    res.render("pages/map");
});

module.exports = router;
