//Get tools we need
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var ejs = require('ejs');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var uri = process.env.MONGOLAB_URI || process.env.LOCAL_URI || 'mongodb://localhost:27017/weight-tracker';


//Configuration
mongoose.connect(uri); //connect to the database

require('./config/passport')(passport); //pass passport for configuration

//Set up express application
app.use(express.static('public')); //serve static resources. putting this up here so sessions will not be created for static resources
app.use(morgan('dev')); //will log every request to console
app.use(cookieParser()); // read cookies, needed for authentication
app.use(bodyParser()); // get info from html forms


app.set('view-engine', 'ejs'); //use ejs for templates
ejs.delimiter = '$';

//required for passport setup
app.use(session({
	secret: 'myserversecret',
	store: new MongoStore({ mongooseConnection: mongoose.connection }) //reusing the exisiting mongoose connection for the session store
}));
app.use(passport.initialize());
app.use(passport.session()); // handles persistent login sessions
app.use(flash()); //use connect-flash for flash messages stored in session

//Routes
require('./app/routes.js')(app, passport); //load our routes and pass in our app and configured passport

//Launch app
app.listen(port);
console.log('App is listening on port ' + port);