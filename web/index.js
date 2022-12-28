const express = require("express");
const app = express();

const config = require("../config.json");

app.get("/", (req, res) => {
    res.send("We're working!");
});

const server = app.listen(config.web.port, () => {
    console.log("Express has been opened on " + config.web.port);
});
