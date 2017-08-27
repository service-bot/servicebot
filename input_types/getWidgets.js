                module.exports = function(){
                    let path = require("path");
                    let glob = require("glob");

                    let files = glob.sync('./**/widgetHandler.js');
                    let types = files.map((file) => {return file.split("/")[2]});
                    return types;

                };