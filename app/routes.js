var User = require('./models/user');

module.exports = function(app, passport){

	app.get('/', nocache, function(req, res){
		if (req.isAuthenticated()){
			res.render('index.ejs', {username: req.user.local.username, password: null, isLoggedIn: true});	
			//Also pass in the list of weighins that should render immediately?		
		} else {
			res.render('index.ejs', {username: null, isLoggedIn: false});
		}
	});

	app.post('/api/login', function(req, res, next){
	    passport.authenticate('local-login',{
	    	badRequestMessage: 'Bad request to Passport during login.'
	    }, function(err, user, info){
	        if (err) {
	            return next(err); // Error 500
	        }

	        if (!user) {
	            //No user, so authentication failed for some reason.
	            return res.status(401).json({error: info.message}); 
	        }

	        //Otherwise, everything was good. Authentication successful
	        //Need to manually log in
	        req.logIn(user, function(err){
	        	if (err) { return next(err); }
	        	res.status(200).json({isLoggedIn: true});
	        });
	    })(req, res, next);
	}); 

	//signup-----------------------------------------------	
	app.post('/api/new-user', function(req, res, next){
		passport.authenticate('local-signup',{
	    	badRequestMessage: 'Bad request to Passport during new user signup.'
	    }, function(err, user, info){
	    	if (err){
	    		return next(err); //Error 500
	    	}

	        //Otherwise, everything was good. Authentication successful
	        //Need to manually log in
	        req.logIn(user, function(err){
	        	if (err) { return next(err); }
	        	res.status(200).json({isLoggedIn: true});
	        });
	    })(req, res, next);
	})


	//profile----------------------------------------------
	//this should be protected so you have to login to visit
	//use route middleware to verify this (isLoggedIn function)
	app.get('/profile', isLoggedIn, nocache, function(req, res){
		res.send(req.user); // get the user out of session
	});

	//logout
	app.get('/logout', nocache, function(req, res){
		req.logout();
		res.redirect('/');
	});

	app.post('/api/weighins', apiIsLoggedIn, function(req, res){
		console.log(req.body);

		var newWeighin = {'date': req.body.date, 'weight': req.body.weight}
		User.findOneAndUpdate(
			{'local.username': req.user.local.username},
			{$push: {weighins: newWeighin}},
			{new: true},
			function(err, doc){
				if (err){
					res.status(500).send({});
				} else {
					console.log("new doc " + doc);
					res.status(200).send(doc.weighins[doc.weighins.length - 1]);
				}
			}
		);
	});

	app.get('/api/weighins', apiIsLoggedIn, nocache, function(req, res){
		console.log(req.user.weighins);
		res.status(200).send(req.user.weighins);
	});

	app.put('/api/weighins/:_id', apiIsLoggedIn, function(req, res){
		User.findOneAndUpdate(
			{'local.username': req.user.local.username, 'weighins._id': req.params._id},
			{$set: {'weighins.$.weight': req.body.weight}},
			{new: true},
			function(err, doc){
				if (err){
					console.log("Errors: " + err);
					res.status(500).send({});				
				} else {
					console.log("New doc: " + doc);
					res.status(200).send(doc.weighins[doc.weighins.length - 1]);
				}				
			}
		);
	});

	app.delete('/api/weighins/:_id', apiIsLoggedIn, function(req, res){
		User.findOneAndUpdate(
			{'local.username': req.user.local.username},
			{$pull: {weighins: {_id: req.params._id}}},
			{new: true},
			function(err, doc){
				if (err) {
					console.log("Errors: " + err);
					res.status(500).send({});
				} else {
					console.log("New doc " + doc);
					res.status(200).send({});
				}
			}
		);				
	});
};

function apiIsLoggedIn(req, res, next){
	if (req.isAuthenticated()){
		return next();
	} else {
		res.status(401).send({});
	}
}

function isLoggedIn(req, res, next){
	if (req.isAuthenticated()){
		return next();
	} else {
		res.redirect('/');
	}
}

function nocache(req, res, next) {
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	next();
}