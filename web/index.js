const express = require("express");
const path = require("path");
const app = express();

const config = require("../config.json");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static("web/static"));

const controllers = require("./controllers");
app.use("/", controllers);



app.get("/discord", (req, res) => {
    res.redirect("https://discord.gg/UnuZeRj9An");
});

app.get("/guilded", (req, res) => {
    res.redirect("https://www.guilded.gg/i/kX11Wolp");
});

app.get("/twitch", (req, res) => {
    res.redirect("https://twitch.tv/ivironenochxii");
});

app.get("/x", (req, res) => {
    res.redirect("https://twitter.com/IVIronEnochXII");
});


app.listen(config.web.port, () => {
    console.log("Express has been opened on " + config.web.port);
});
