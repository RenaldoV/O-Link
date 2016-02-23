var db = require("./models/Database.js");
var errorHandler = require('./errors.js');
var crypto = require('crypto');
var async = require('async');

function getDate(){
	var currentdate = new Date();
	var datetime = currentdate.getFullYear() + "-"
		+ (currentdate.getMonth()+1)  + "-"
		+ currentdate.getDate()  + " "
		+ currentdate.getHours() + ":"
		+ currentdate.getMinutes() + ":"
		+ currentdate.getSeconds();
	return datetime;
}



module.exports = function(app) {


	// frontend routes =========================================================
	// route to handle all angular requests



	app.get('*', function(req, res) {

		res.sendfile('./public/index.html');

	});


	// server routes ===========================================================
	// db routes
	// authentication routes
	
	app.post('/forgot', function(req, res, next) {
		var user;
		for(var key in req.body)
		{
			user = JSON.parse(key);
		}
		
		async.waterfall([
			function(done) {
				crypto.randomBytes(20, function(err, buf) {
					var token = buf.toString('hex');
					done(err, token);
				});
			},
			function(token, done) {
				
				db.getUser(user.email,function(User){
					if(!User) res.send(false);
					
					var tempUser = User.toJSON();
					
					tempUser.resetPasswordToken = token;
					tempUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour	
					// FOR FUCK SAKES!!!!! 
					console.log(tempUser); //tempUser not reflecting 2 new fields
					db.update({"_id" : tempUser._id},"users",tempUser,
					function(res){
						console.log(res);
					});
					
					res.send(tempUser);
				});
				
/*				db.checkMail({email: user.email} , function(result){
					if(result.valid == true){
						user.resetPasswordToken = token;
						user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
						var _id = user._id;
						delete user._id;
						db.update({"_id" : user._id},"users",user);
						//console.log(user);
						res.send(result.user);
					}
					else res.send(false);
				});
 				User.findOne({ email: req.body.email }, function(err, user) {
					if (!user) {
					  req.flash('error', 'No account with that email address exists.');
					  return res.redirect('/forgot');
					}

					user.resetPasswordToken = token;
					user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

					user.save(function(err) {
					  done(err, token, user);
					});
				}); */
			}
/* 			function(token, user, done) {
				var smtpTransport = nodemailer.createTransport('SMTP', {
					service: 'SendGrid',
					auth: {
					  user: '!!! YOUR SENDGRID USERNAME !!!',
					  pass: '!!! YOUR SENDGRID PASSWORD !!!'
					}
				});
				var mailOptions = {
					to: user.email,
					from: 'passwordreset@demo.com',
					subject: 'Node.js Password Reset',
					text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
					  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
					  'http://' + req.headers.host + '/reset/' + token + '\n\n' +
					  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
				};
				smtpTransport.sendMail(mailOptions, function(err) {
					req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
					done(err, 'done');
				});
			} */
		], function(err) {
			if (err) return next(err);
			res.redirect('/forgot');
		});
	});
	
	app.post('/jobFeeder', function(req,res){

		db.selectAll("jobs", function(rows){

			res.send(rows);
		});
	});

	app.post('/jobBrowse', function(req,res){


		var temp = req.body;



		db.getByArr("jobs", 'post.category', temp, function(rows){

			res.send(rows);
		});
	});
	app.post('/jobPoster', function(req,res) {
		var job = {};
		for(var key in req.body) {

			console.log(key);
			job = JSON.parse(key);

		}




		db.insert(job,'jobs',function(result){
				res.send(result);
		});
	});


	app.post('/signin', function(req,res) {
		var user = {};
		for(var key in req.body) {

			console.log(key);
			user = JSON.parse(key);

		}

		db.checkLogin(user.email,user.password,function(result){

			if(result.valid == true){
				res.send(true);
			}
			else res.send(false);
		});
	});

	app.post('/signup', function(req,res) {
		var user = {};
		for(var key in req.body) {


			user = JSON.parse(key);

		}


		db.addUser(user,function(result){
			res.send(result);
			//console.log(user);
		});

	});

	app.post('/studentFeeder', function(req,res) {

		db.selectAll("students", function(rows){
			res.send(rows);
		});

	});

	app.post('/loadUser', function(req,res) {
		var email = req.body;
		console.log(email)
		db.getUser(email.email, function(rows){
			res.send(rows);
		});

	});

	app.post('/getJob', function(req,res) {

		var id= req.body;

		db.getById('jobs',id.id, function(rows){
			res.send(rows);
		});

	});

	app.post('/loadUserById', function(req,res) {
		var id= req.body;

		db.getById('users',id.id, function(rows){
			res.send(rows);
		});

	});

};