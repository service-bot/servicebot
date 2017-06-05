let knex = require('../config/db.js');
let _ = require('lodash');
let fs = require("fs");
let path = require("path");
let File = require('./base/entity.js')("files");

File.findFile = function(filePath, id, callback){
    let upload_path = path.normalize(`${filePath}/${id}-%`).split("\\").join("\\\\")
    knex(File.table).where("path", "like", upload_path).orderBy("id", "desc")
        .then(function(result){
            console.log(result);
            if (!result) {
                result = [];
            }
            let files = result.map(e => new File(e));
            callback(files);
        });
};

File.prototype.delete = function(callback){
    let id = this.get('id');
    let filePath = this.get("path");
    fs.unlink(filePath, err => {
        if(err){
            console.log("error deleting file " + err);
        }
        else{
            console.log(`deleted file ${id} with path ${filePath}`)
        }
	});
    knex(File.table).where('id', id).del()
        .then(callback())
        .catch(function (err) {
            console.log(err);
        });
};

module.exports = File;
