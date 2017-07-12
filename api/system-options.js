
let auth = require('../middleware/auth');
let SystemOption = require('../models/system-options');
let EventLogs = require('../models/event-log');
let validate = require('../middleware/validate');
let multer = require("multer");
let File = require("../models/file");
let mkdirp = require("mkdirp");
let path = require("path");
let dispatchEvent = require("../config/redux/store").dispatchEvent;

let systemFilePath = "uploads/system-options";


let systemStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        mkdirp(systemFilePath, err => cb(err, systemFilePath))
    },
    filename: function (req, file, cb) {
        require('crypto').pseudoRandomBytes(8, function (err, raw) {
            cb(err, err ? undefined : req.params.id + "-" + raw.toString('hex'))
        })
    }
});

let systemFiles = ['front_page_image', 'brand_logo'];

module.exports = function (router) {


    router.get(`/system-options/file/:id`, function (req, res, next) {
        if (systemFiles.indexOf(req.params.id) > -1) {
            File.findFile(systemFilePath, req.params.id, function (image) {
                if (image.length > 0) {
                    let file = image[0];
                    let options = {
                        headers: {
                            'Content-Disposition': "inline; filename=" + file.get("name")
                        }
                    };
                    let abs = path.resolve(__dirname, "../" + file.get("path"));

                    res.sendFile(abs, options)
                } else {
                    //todo: make less hardcoded.. maybe seperate api calls again
                    if(req.params.id == "brand_logo"){
                        return res.sendFile(path.resolve(__dirname, "../public/assets/logos/servicebot-logo.png"));
                    }
                    else {
                        res.status("400").send("no image");
                    }
                }
            });
        }
        else {
            res.status("400").send("not a valid system file option");
        }

    });


    // router.get(`/system-options/:id(\\d+)`, validate(SystemOption, 'id', 'option'), auth(), function (req, res, next) {
    //     res.json(res.locals.valid_object.data);
    // });


    router.get(`/system-options/public`, function (req, res, next) {
        SystemOption.findAll("public", true, function (results) {
            res.json(results.reduce((acc, entity) => {
                acc[entity.data.option] = entity.data;
                return acc;
            }, {}));
        });
    });


    // router.get('/system-options', function (req, res, next) {
    //     let key = req.query.key;
    //     let value = req.query.value;
    //     if (!key || !value) {
    //         key = undefined;
    //         value = undefined;
    //     }
    //     SystemOption.findAll(key, value, function (results) {
    //         res.json(results.map(entity => entity.data));
    //     });
    // });

    router.put('/system-options/file/:id', auth(), multer({storage: systemStorage }).single('file'), function (req, res, next) {
        if (systemFiles.indexOf(req.params.id) > -1) {
            let file = req.file;
            file.name = file.originalname;
            file.user_id = req.user.get('id');
            File.findFile(systemFilePath, req.params.id, function (brandLogo) {
                if (brandLogo.length > 0) {
                    let logoToDelete = brandLogo[0];
                    logoToDelete.delete(function () {
                    });
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
            res.status("400").send("not a valid system file option");
        }
    });


    // router.put('/system-options/:id(\\d+)', validate(SystemOption, 'id', 'option'), auth(), function (req, res, next) {
    //     let entity = res.locals.valid_object;
    //     entity.data.value = req.body.value;
    //     entity.update(function (err, result) {
    //         EventLogs.logEvent(req.user.get('id'), `system-options ${req.params.id} was updated by user ${req.user.get('email')}`);
    //         res.json(result.data);
    //     })
    // });

    router.put('/system-options', auth(), function (req, res, next) {
        let updateData = req.body;
        SystemOption.findAll("public", true, function (options) {
            let filteredUpdates = updateData.filter((option) => {
                return options.some((publicOption) => option.option == publicOption.get("option"));
            })

            SystemOption.batchUpdate(filteredUpdates, function (result) {
                let updated = result.reduce((settings, setting)=>{
                    console.log(setting);
                    settings[setting[0].option] = setting[0].value;
                    return settings;
                }, {});
                dispatchEvent("system_options_updated", updated);
                EventLogs.logEvent(req.user.get('id'), `system-options were updated by user ${req.user.get('email')}`);
                res.json(result);
            })
        });
    });


    return router;
};