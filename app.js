require("./discord/");
require("./web/");

setInterval(require("./intervals/retrieveLivestreams"), 15000);

require("./tasks");
