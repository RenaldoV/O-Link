var db = require("./models/Database.js");
var errorHandler = require('./errors.js');
var crypto = require('crypto');
var async = require('async');
var nodemailer 		= require('nodemailer');
var smtpttransport = require('nodemailer-smtp-transport');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty({ uploadDir: './tmp' });
var fs = require('fs');

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
	app.post('/reset/:token', function(req, res) {
		var pw;
		for(var key in req.body)
		{
			pw = JSON.parse(key);
		}
		//console.log("Token: " + JSON.stringify(req.params.token));
		//console.log("PW: " + JSON.stringify(pw));

		async.waterfall([
			function(done) {


				db.getOneByReset({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(user) {
					if (!user) {
						return res.send('error');
					}
		 			var tempUser = user.toJSON();
		 			tempUser.passwordHash = pw.passwordHash;

		 			tempUser.resetPasswordToken = undefined;
		 			tempUser.resetPasswordExpires = undefined;

					db.updateUser({"_id" : tempUser._id},tempUser,
						function(err, res1, updatedUser){
							if(!err) {
								return res.send(updatedUser);
								done(err, user);
							}
							else {
								return res.send("error");
							}
						});

				});
			},
			function(user, done) {
		 		var tempUser = user.toJSON();
				var smtpTransport = nodemailer.createTransport('smtps://olinkmailer%40gmail.com:mailClient@smtp.gmail.com');
				var mailOptions = {
					to: tempUser.contact.email,
					from: 'passwordreset@demo.com',
					subject: 'Your password has been changed',
					text: 'Hello,\n\n' +
					'This is a confirmation that the password for your account ' + tempUser.contact.email + ' has just been changed.\n'
				};
				smtpTransport.sendMail(mailOptions, function(err) {
		 			done(err, 'done');
				});
			}
		], function(err) {
			res.send('error');
		});
	});
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
					if(!User)  return res.send(false);
					
					var tempUser = User.toJSON();
					tempUser.resetPasswordToken = token;
					tempUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour	
 
					db.update({"_id" : tempUser._id},"users",tempUser,
					function(err,res){
						done(err,token,User);
					});
					
					res.send(tempUser);
				});
			},
 			function(token, user, done) {

				var tempUser = user.toJSON();
				var smtpTransport = nodemailer.createTransport(smtpttransport({
					service: "Gmail",
					auth: {
						user: "olinkmailer@gmail.com",
						pass: "olinkMailer"
					},
					tls: {rejectUnauthorized: false}
				}));
				var mailOptions = {
					to: tempUser.contact.email,
					from: 'passwordreset@demo.com',
					subject: 'O-Link Password Reset',
					text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
					  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
					  'http://' + req.headers.host + '/reset/' + token + '\n\n' +
					  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
				};
				smtpTransport.sendMail(mailOptions, function(err) {
					done(err, 'done');
				});
			} 
		], function(err) {
			if (err) return next(err);

		});
	});
	
	app.post('/jobFeeder', function(req,res){

		db.selectAll("jobs", function(rows){

			res.send(rows);
		});
	});

	app.post('/myJobFeeder', function(req,res){

		var user = req.body;

		db.getBy("jobs", {employerID: user.id, status: {$ne: "inactive"}}, function(rows){

			res.send(rows);
		});
	});

	app.post('/jobBrowse', function(req,res){


		var temp = req.body;



		db.getByArr("jobs", 'post.category', temp.categories, temp.periods, function(rows){


			res.send(rows);
		});
	});
	app.post('/jobPoster', function(req,res) {
		var job = {};

		for(var key in req.body) {

			job = JSON.parse(key);

		}

		db.insert(job,'jobs',function(result){
				res.send(result);
		});
	});

	app.post('/jobUpdate', function(req,res) {
		var job = {};

		for(var key in req.body) {

			job = JSON.parse(key);

		}

		db.update({_id: job._id},'jobs', job,function(result){
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




			//add activation token and insert into db
		crypto.randomBytes(20, function(err, buf) {
				var token = buf.toString('hex');
				user.activateToken = token;
				db.addUser(user,function(result){
					if(result)
						res.send(result);
					if(result != 'email' && !err){

						/*var smtpTransport = nodemailer.createTransport("SMTP",{
							service: "Gmail",
							auth: {
								user: "gmail.user@gmail.com",
								pass: "userpass"
							}
						})*/
					//var smtpTransport = nodemailer.createTransport(smtpttransport('smtps://olinkmailer%40gmail.com:mailClient@smtp.gmail.com'));

					var smtpTransport = nodemailer.createTransport(smtpttransport({
						service: "Gmail",
						auth: {
							user: "olinkmailer@gmail.com",
							pass: "olinkMailer"
						},
						tls: {rejectUnauthorized: false}
					}));
					var mailOptions = {
						to: user.contact.email,
						from: 'activationt@olink.com',
						subject: 'Activate your new olink account',
						text: 'You are receiving this because you (or someone else) have signed up to use olink.\n\n' +
						'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
						'http://' + req.headers.host + '/activate?token=' + token + '\n\n' +
						'If you did not request this, please ignore this email and your password will remain unchanged.\n'
					};
					smtpTransport.sendMail(mailOptions, function(err) {
						if(err) throw err;
					});
					}
			});


		});

	});

	app.post('/studentFeeder', function(req,res) {

		db.selectAll("students", function(rows){
			res.send(rows);
		});

	});

	app.post('/loadUser', function(req,res) {
		var email = req.body;
		db.getUser(email.email, function(rows){
			res.send(rows);
			console.log(rows);
		});

	});

	app.post('/getJob', function(req,res) {

		var id= req.body;
		console.log(id);

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
	app.post('/upload', multipartyMiddleware, function(req, res){
		var file = req.files.file;
		var id = req.body.user;

		fs.readFile(file.path, function (err, data) {
			// ...


			var temp = file.path;
			console.log(temp);
			temp = temp.replace("tmp\\", '\\uploads\\');
			temp = temp +".png";
			var newPath = __dirname + temp;

			fs.writeFile(newPath, data, function (err) {
				if(err) throw err;


				db.update({_id : id}, 'users', {profilePicture: temp}, function(err){
					if (err) throw err;
					console.log(temp);
					fs.unlink(file.path);
					res.send(true);
				} );
			});

		});

	});

	app.post('/getPp', function(req, res){

		var path = req.body.profilePicture;
		path = __dirname + path;
		var def = __dirname + "\\uploads\\default.png";
		console.log(path);
		fs.readFile(path, function(err,data){
			if(err) {
				fs.readFile(def, function(err,data){
					if(err) {

					}
					var buf = new Buffer(data).toString('base64');
					res.send(buf);
				});
			}else {
				var buf = new Buffer(data).toString('base64');
				res.send(buf);
			}
		});




	});

	app.post('/updateUser', function(req,res){

		var user = req.body;
		delete user.profilePicture;
		db.update({_id : user._id}, 'users', user, function(err){
			if (err) throw err;

			res.send(true);
		} );

	});

	app.post('/apply', function(req,res){

		var user = req.body.user;
		var job =  req.body.job;
		if(!job.applicants)
		{
			job.applicants = [];
		}
		job.applicants.push(user._id);


		var application = {
			studentID : user._id,
			jobID: job._id,
			employerID: job.employerID,
			status: 'Pending'

		};
		db.insert(application, 'applications', function(ress){
			db.update({_id: job._id}, 'jobs',job, function(result){
				res.send(ress);
			});

		});
	});

	app.post('/updateApplication', function(req,res){

		var app = req.body;
		console.log(app);
		db.update({_id : app._id}, 'applications', app, function(err){
			if (err) throw err;

			res.send(true);
		} );

	});

	app.post('/loadApplications', function(req,res){

		var user = req.body;
		db.getStudentApplications(user._id, function(rows){
			res.send(rows);
		});


	});
	app.post('/loadApplicationsTo', function(req,res){

		var user = req.body;
		db.getStudentApplicationsBy(user._id, function(rows){
			res.send(rows);
		});


	});

	app.post('/loadApplicants', function(req,res){

		var user = req.body;
		db.getEmployerApplicants(user._id, function(rows){
			res.send(rows);
		});


	});

	app.post('/loadApplicantsByJobId', function(req,res){

		var job = req.body;
		db.getJobApplicants(job._id, function(rows){
			res.send(rows);
		});


	});

	app.post('/loadNotifications', function(req,res){


		db.loadNotifications(req.body.id, function(rows){
			res.send(rows);
		});


	});

	app.post('/makeSeen', function(req,res){

		var app = req.body;
		console.log(app);
		db.update({_id : app.id}, 'notifications', {seen : true}, function(err){
			if (err) throw err;

			res.send(true);
		} );

	});

	app.post('/loadCompletedApplications', function(req,res){

		var emp = req.body;

		db.getCompletedApplicants(emp.id, function(rows){

			res.send(rows);
		});


	});

	app.post('/loadCompletedJobs', function(req,res){

		var student = req.body;

		db.getCompletedApplications(student.id, function(rows){

			res.send(rows);
		});


	});
	app.post('/loadJobHistory', function(req,res){

		var student= req.body;

		db.getJobHistory(req.body, function(rows){

			res.send(rows);
		});


	});

	app.post('/activateUser', function(req,res){
		var user = req.body;
		console.log(user);
		db.activateUser(req.body.token, function(row){
			console.log(row);
			res.send(row);
		});
	});

	app.post('/removeJob', function(req,res){
		var id = req.body.id;
		console.log(req.body);
		db.remove('jobs',id, function (row) {
			res.send(row);
			
		});
	});

	app.post('/checkPassword', function(req,res){

		var user = req.body;

		db.checkLogin(user.email,user.password,function(result){
			
			if(result.valid == true){
				res.send(true);
			}
			else res.send(false);
		});
	});

	app.post('/getStats', function(req,res) {


		var user = req.body;
		db.getStats(user, function(r){

			console.log(r);
			res.send(r);
		});

	});


};