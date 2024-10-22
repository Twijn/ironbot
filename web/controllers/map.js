const express = require('express');
const router = express.Router();

const bodyParser = require("body-parser");

const utils = require("../../utils");

/**
 *
 * @type {{type: "lookup"|"save",identity: string, time: number}[]}
 */
let requests = [];

/**
 * Checks rate limit for an identity
 * @param type {"lookup"|"save"}
 * @param identity {string}
 * @param limit {number}
 * @param timeLimit {number}
 * @returns {used: number, remaining: number, reset: number}
 */
const checkRateLimit = (type, identity, limit, timeLimit) => {
    requests = requests.filter(x => x.type !== type || x.time > Date.now() - timeLimit);

    let previousRequests = requests.filter(x => x.type === type && x.identity === identity);

    const reset = (previousRequests.length > 0 ? previousRequests[0].time : Date.now()) + timeLimit;

    if (previousRequests.length < limit) {
        requests.push({
            type, identity,
            time: Date.now(),
        });
    }

    return {
        used: previousRequests.length,
        remaining: limit - previousRequests.length,
        reset,
    };
}

/**
 * Stores lookup request for rate limiting
 * @type {{identity: string, time: number}[]}
 */
let lookupRequests = [];
router.get("/lookup/:query", (req, res) => {
    if (req.discordUsers.length === 0 || !req?.session?.identity?._id) {
        return res.json({ok: false, error: "You must be logged in to look up locations."});
    }

    utils.MapManager.findLocationFromQuery(req.params.query, req.session.identity._id).then(data => {
        res.json({ok: true, data});
    }, error => {
        res.json({ok: false, error});
    });
});

router.post("/save", bodyParser.json(), (req, res) => {
    if (req.discordUsers.length === 0 || !req?.session?.identity?._id) {
        return res.json({ok: false, error: "You must be logged in to save locations."});
    }

    console.log("[Map] Handling save request from " + req.session.identity._id);

    const lat = Number(req?.body?.latitude);
    const lng = Number(req?.body?.longitude);
    const name = String(req?.body?.name);

    if (isNaN(lat) || isNaN(lng)) {
        console.log("[Map] Latlng invalid");
        return res.json({ok: false, error: "Latitude and Longitude must be a number"});
    }

    if (!name || name.length > 128 || name.length < 3) {
        console.log("[Map] Location name invalid");
        return res.json({ok: false, error: "Location name must be between 3 and 128 characters long"});
    }

    utils.MapManager.saveLocation(lat, lng, name, req.session.identity._id).then(data => {
        res.json({ok: true, data});
    }, error => {
        res.json({ok: false, error});
    });
});

router.delete("/delete", (req, res) => {
    if (req.discordUsers.length === 0 || !req?.session?.identity?._id) {
        return res.json({ok: false, error: "You must be logged in to delete locations."});
    }

    utils.MapManager.deleteLocation(req.session.identity._id).then(() => {
        res.json({ok: true});
    }, error => {
        res.json({ok: false, error});
    });
});

router.get("/", (req, res) => {
    res.render("pages/map", {
        twitchUsers: req.twitchUsers,
        discordUsers: req.discordUsers,
        identity: req?.session?.identity,
    });
});

router.get("/json", (req, res) => {
    res.json(utils.MapManager.get());
});

module.exports = router;
