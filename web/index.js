const express = require("express");
const path = require("path");
const app = express();

const config = require("../config.json");

app.get("/", (req, res) => {
    res.redirect("https://discord.gg/UnuZeRj9An");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static("web/static"));

app.listen(config.web.port, () => {
    console.log("Express has been opened on " + config.web.port);
});
