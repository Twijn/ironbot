const express = require("express");
const router = express.Router();

const discord = require("./discord");
const twitch = require("./twitch");

router.use("/discord", discord);
router.use("/twitch", twitch);

module.exports = router;
