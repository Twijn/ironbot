const express = require("express");
const router = express.Router();

const discord = require("./discord");
const steam = require("./steam");
const twitch = require("./twitch");

router.use("/discord", discord);
router.use("/steam", steam)
router.use("/twitch", twitch);

module.exports = router;
