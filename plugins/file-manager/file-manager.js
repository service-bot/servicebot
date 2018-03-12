let {call, put, all, select, fork, spawn, take} = require("redux-saga/effects");
let consume = require("pluginbot/effects/consume");
let multer = require("multer");
let fs = require("fs");
let path = require("path");
let mkdirp = require("mkdirp");
function* run(config, provide, channels) {
    let db = yield consume(channels.database);

    //todo - implement better file system
    let File = require("../../models/file");

    let storage = function (path) {
        return multer.diskStorage({
            destination: function (req, file, cb) {
                mkdirp(path, err => cb(err, path))
            },
            filename: function (req, file, cb) {
                require('crypto').pseudoRandomBytes(8, function (err, raw) {
                    cb(err, err ? undefined : req.params.id + "-" + raw.toString('hex'))
                })
            }
        });
    }
    let fileManager = {
        storage: (filePath) => storage(filePath),
        // middleware: function (req, res, next) {
        //
        // },
        // getFile: function (id) {
        //
        // },
        // //todo : this should be deprecated in future - everythign should be ID
        // getFileByPath: function (path, prefix) {
        //
        // },
        sendFile : function(file, res){
            let options = {
                headers: {
                    'Content-Disposition': "inline; filename=" + file.get("name")
                }
            };
            let abs = path.resolve(__dirname, "../../" + file.get("path"));

            res.sendFile(abs, options, (err) => {
                if(err) {
                    console.error(err);
                    res.status(500).json({error: err})
                }
            })

        },
        deleteFile: async function (file) {
            if (!file) {
                throw "File not found";
            }
            let filePath = file.get("path");
            fs.unlink(filePath, err => {
                if (err) {
                    console.log("error deleting file " + err);
                }
                else {
                    console.log(`deleted file ${file.get("id")} with path ${filePath}`)
                }
            });
            await file.delete();
            console.log("deleted file");
        },
    };
    yield provide({fileManager});
}

module.exports = {run};