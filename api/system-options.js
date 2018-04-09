
let auth = require('../middleware/auth');
let SystemOption = require('../models/system-options');
let EventLogs = require('../models/event-log');
let validate = require('../middleware/validate');
let multer = require("multer");
let File = require("../models/file");
let mkdirp = require("mkdirp");
let path = require("path");
let systemFilePath = "uploads/system-options";
let appPackage = require("../package.json");
let store = require("../config/redux/store")

let fileManager = store.getState(true).pluginbot.services.fileManager[0];
let systemFiles = ['front_page_image', 'brand_logo', 'loader_logo'];
let uploadLimit = function(){

    return store.getState().options.upload_limit * 1000000;

}

let upload = () => {
    return multer({storage: fileManager.storage(systemFilePath), limits : {fileSize : uploadLimit()}})
}

module.exports = function (router) {


    router.get(`/system-options/file/:id`, function (req, res, next) {
        if (systemFiles.indexOf(req.params.id) > -1) {
            File.findFile(systemFilePath, req.params.id, function (image) {
                if (image.length > 0) {
                    let file = image[0];
                    fileManager.sendFile(file, res);
                } else {
                    //todo: make less hardcoded.. maybe seperate api calls again
                    if(req.params.id == "brand_logo"){
                        return res.sendFile(path.resolve(__dirname, "../public/assets/logos/v1/servicebot-logo-full-white.png"));
                    } else if(req.params.id == "loader_logo") {
                        return res.sendFile(path.resolve(__dirname, "../public/assets/logos/v1/servicebot-logo-full-blue.png"));
                    } else {
                        res.status(400).send("no image");
                    }
                }
            });
        }
        else {
            res.status(400).send("not a valid system file option");
        }

    });

    router.put('/system-options/file/:id', auth(), upload().single('file'), function (req, res, next) {
        if (systemFiles.indexOf(req.params.id) > -1) {
            let file = req.file;
            file.name = file.originalname;
            file.user_id = req.user.get('id');
            File.findFile(systemFilePath, req.params.id, function (brandLogo) {
                if (brandLogo.length > 0) {
                    let logoToDelete = brandLogo[0];
                    fileManager.deleteFile(logoToDelete);
                }
                let icon = new File(file);
                icon.create(function (err, result) {
                    result.message = "File Uploaded";
                    EventLogs.logEvent(req.user.get('id'), `system-options ${req.params.id} was updated by user ${req.user.get('email')}`);
                    res.json(result);
                })
            })
        }
        else {
            res.status(400).send("not a valid system file option");
        }
    });

    router.get(`/system-options/version`, auth(), function (req, res, next) {
        res.status(200).send({version:appPackage.version});
    });


    return router;
};