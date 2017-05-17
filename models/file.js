var knex = require('../config/db.js');
var _ = require('lodash');
var fs = require("fs");
var path = require("path");
var File = require('./base/entity.js')("files");

//TODO change the ifs around the callback
//done because it was called in a lot of places not expecting an array
File.findFile = function(filePath, id, callback){
    var upload_path = path.normalize(`${filePath}/${id}-%`).split("\\").join("\\\\")
    knex(File.table).where("path", "like", upload_path).orderBy("id", "desc")
        .then(function(result){
            console.log(result);
            if(result.length > 1){
                callback(result);
            }
            else{
                callback(result[0]);
            }
        });
};

File.deleteByParent = function(filePath, id, callback){
    var upload_path = path.normalize(`${filePath}/${id}-%`).split("\\").join("\\\\")
    knex(File.table).where("path", "like", upload_path).orderBy("id", "desc")
        .then(function(result){
            console.log(result);
            if(result.length > 0){
                for(let file in result){
                    let tempFile = new File(result[file]);
                    console.log(`deleting file ${tempFile.get('name')} ${tempFile.get('path')}`)
                    tempFile.delete(function(response){
                        console.log(`instance ${id} file deleted`);
                    })
                }
                callback(result);
            }
            else{
                callback(result[0]);
            }
        });
};


File.prototype.delete = function(callback){
    var self = this;
    var id = this.get('id');
    var path = this.get("path");
	fs.unlink(path, err => {
		console.log(err);
		console.log("deleted!")
	})
    knex(File.table).where('id', id).del()
        .then(callback())
        .catch(function (err) {
            console.log(err);
        });
};






module.exports = File;
