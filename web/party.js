const {Router} = require("express");
const router = Router();

const fs = require("fs");

router.get("/", (req, res) => {
    res.status(404);
    res.send("Not found");
});

const NAME_REGEX = /^[A-Za-z0-9]{32}\.[a-z]+$/;
const FILE_DIRECTORY = global.appdir + "/files/";
 
router.get('/:file', (req, res) => {
    if (req.params.file.match(NAME_REGEX) && fs.existsSync(FILE_DIRECTORY + req.params.file)) {
        res.sendFile(FILE_DIRECTORY + req.params.file);
    } else {
        res.status(404);
        res.send("Not found");
    }
});
 
module.exports = router;