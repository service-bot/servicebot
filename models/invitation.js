var knex = require('../config/db');
//TODO - figure something about schema... probably should define schema in code somewhere to create tables and pull that and validate any fields there.


let Invitation = require("./base/entity")("invitations");

//requires a usert_id
Invitation.prototype.create = function (callback) {
    var self = this;
    //this.data = this.sanitize(this.data);

    require('crypto').randomBytes(20, function(err, buffer) {
		self.set("token", buffer.toString('hex'));
		knex('invitations').columnInfo().returning('id').insert(self.data)
    	.then(function(result){
	    	console.log(self)
	    	self.set("id", result[0]);
	    	callback(null, self);
    	})
    	.catch(function(err){
	    	console.error("Error creating invite\n", err);
	    	callback(err, self)
    	});
		
	});
}













module.exports = Invitation;
