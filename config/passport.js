//load tools we need
var LocalStrategy = require('passport-local').Strategy;

//load user model
var User = require('../app/models/user');

module.exports = function(passport){
	//session setup for persistent login sessions
	//passport needs to be able to "serialize" and "deserialize" users 

	//to serialize
	passport.serializeUser(function(user, done){
		done(null, user.id);
	});

	//to deserialize
	passport.deserializeUser(function(id, done){
		User.findById(id, function(err, user){
			done(err, user);
		});
	});

	//Local signup
	passport.use('local-signup', new LocalStrategy({
		passReqToCallback: true
	},
	function(req, username, password, done){
		console.log("Running local-signup");
		//asynchronous
		//User.findOne won't fire unless data is sent back
		process.nextTick(function(){
			//find a user whose username is the same as the form's username
			//we are checking to see if the user trying to login already exists
			User.findOne({'local.username': username}, function(err, user){
				//if any errors ,return the error
				if (err)
					return done(err);
				//check if user already exists
				if (user){
					console.log("already exists");
					return done(null, false, {message: "User already exists."});
				} else {
					console.log("got to else statement");
					//create user
					var newUser = new User();
					//set credentials
					newUser.local.username = username;
					newUser.local.password = newUser.generateHash(password);
					//save user
					newUser.save(function(err){
						if (err)
							throw err;
						return done(null, newUser);
					});
				}
			});
		});
	}));

	passport.use('local-login', new LocalStrategy({
		passReqToCallback: true
	},
	function(req, username, password, done){
		User.findOne({'local.username': username}, function(err, user){
			if (err)
				return done(err);
			if (!user) //no user found
				return done(null, false, {message: "User not found."});
			if (!user.validPassword(password)) //wrong password
				return done(null, false, {message: "Invalid password."});

			return done(null, user);
		});
	}));
};