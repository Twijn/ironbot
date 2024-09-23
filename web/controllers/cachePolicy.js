const express = require("express");
const router = express.Router();

const MAX_AGE = 31536000; // 1 year
const S_MAX_AGE = MAX_AGE;

router.use((req, res, next) => {
    res.set('Cache-Control', `public, max-age=${MAX_AGE}, s-maxage=${S_MAX_AGE}`);
    next();
});

module.exports = router;
