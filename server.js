// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride 	= require('method-override');
var session 		= require('express-session')
var nodemailer 		= require('nodemailer');
var cookieParser 	= require('cookie-parser');



// configuration ===========================================


//file upload
// Requires multiparty



var port = process.env.PORT || 8080; // set our port
// mongoose.connect(db.url); // connect to our mongoDB database (commented out after you enter in your own credentials)

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(cookieParser());
app.use(session({ secret: 'session secret key' , resave : false , saveUninitialized : false})); //Add secret to session
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

// routes ==================================================
require('./app/routes')(app); // pass our application into our routes

// start app ===============================================
var io = require('socket.io').listen(app.listen(port));
console.log('Magic happens on port ' + port);
exports = module.exports = app; 						// expose app


//io

var db = require("./app/models/Database.js");

io.on('connection', function(socket){
    socket.on('notify', function(data){
        console.log(data);
    } );
});




