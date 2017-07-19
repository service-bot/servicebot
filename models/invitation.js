let knex = require('../config/db');

let Invitation = require("./base/entity")("invitations");

//requires a user_id
Invitation.prototype.create = function (callback) {
    let self = this;
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
};

module.exports = Invitation;
