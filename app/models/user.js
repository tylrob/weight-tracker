//load tools you need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

//define schema
var userSchema = mongoose.Schema({

	local: { username: String, password: String },

	weighins: [{ date: Date, weight: Number }]

});

//methods
//generating a hash
userSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//checking if password is valid
userSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.logSomething = function(text){
	console.log("Here's your text: " + text.somekey);
};

userSchema.methods.pushToArray = function(data){

};

module.exports = mongoose.model('User', userSchema);