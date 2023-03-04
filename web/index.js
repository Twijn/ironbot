const express = require("express");
const app = express();

const config = require("../config.json");

app.get("/", (req, res) => {
    res.redirect("https://discord.gg/UnuZeRj9An");
});

const server = app.listen(config.web.port, () => {
    console.log("Express has been opened on " + config.web.port);
});
