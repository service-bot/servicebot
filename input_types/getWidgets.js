
            let glob = require("glob");
            let files = glob.sync('./**/widgetHandler.js');
             let types = files.map((file) => {return file.split("/")[1]});
                module.exports = types;