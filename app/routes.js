var db = require("./models/Database.js");
var errorHandler = require('./errors.js');
var crypto = require('crypto');
var async = require('async');
var nodemailer 		= require('nodemailer');
var smtpttransport = require('nodemailer-smtp-transport');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty({ uploadDir: './tmp' });
var fs = require('fs');
var passwordHash = require('password-hash');

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


////////////////////////////////////////////////////////////////////
	//begin chop
////////////////////////////////////////////////////////////////////

	//Returns the 10 latest job posts for students
	app.post('/jobFeeder', function(req,res){

		db.jobs.find({}).limit(10).sort('-postDate').exec(function(err,rows){
			if(err){

			}
			res.send(rows);
		});

	});
	//done


	//Returns all job posts from logged in employer
	app.post('/myJobFeeder', function(req,res){

		var user = req.body;

		db.jobs.find({employerID: user.id, status: {$ne: "inactive"}},function(err,rows){
			if(err){

			}
			res.send(rows);
		});

	});
	//done


	//Gets jobs based on categories and time periods
	app.post('/jobBrowse', function(req,res){

		var temp = req.body;

		db.jobs.find().where('post.category').in(temp.categories).where('post.timePeriod').in(temp.periods).exec(function(err,rows){
			res.send(rows);
		});

	});
	//done


	//post a job to database
	app.post('/jobPoster', function(req,res) {

		var job = {};
		for(var key in req.body) {
			job = JSON.parse(key);
		}

		db.jobs.create(job,function(err, jobi){
			console.log(jobi);
			res.send(jobi);
		});

	});
	//done


	//update job in database
	app.post('/jobUpdate', function(req,res) {

		var job = {};
		for(var key in req.body) {
			job = JSON.parse(key);
		}

		db.jobs.update({_id: job._id}, {$set: job}, function(err,result){
			res.send(result);
		});

	});
	//done

	//sign in to the app
	app.post('/signin', function(req,res) {
		var user = {};

		for(var key in req.body) {
			user = JSON.parse(key);
		}

		db.users.findOne({'contact.email': user.email}, function(err,doc){
			if(err){

			}else {

				if (doc) {
					if (passwordHash.verify(user.password, doc.toObject().passwordHash)) {
						res.send(true);
					}else
					res.send(false);
				}else
				res.send(false);
			}
		});
	});
	//done

	//Add a new user to the db
	app.post('/signup', function(req,res) {

		var user = {};
		for(var key in req.body) {
			user = JSON.parse(key);
		}

		//add activation token and insert into db
		crypto.randomBytes(20, function(err, buf) {
				var token = buf.toString('hex');
				user.activateToken = token;
				user.passwordHash = passwordHash.generate(user.passwordHash);
				db.users.create(user,function(e,result){
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
						'If you did not request this, please ignore this email.\n'
					};
					smtpTransport.sendMail(mailOptions, function(err) {
						if(err) throw err;
					});
					}
			});


		});

	});
	//done

	//Gets all students
	app.post('/studentFeeder', function(req,res) {

		db.users.find({type: "student"}, function(err, rows){
			res.send(rows);
		});
	});
	//sone

	//load user by email
	app.post('/loadUser', function(req,res) {
		var email = req.body;
		db.users.findOne({'contact.email': email.email}, function(err, rows){
			res.send(rows);
		});

	});
	//done
	//get job by id
	app.post('/getJob', function(req,res) {

		var id= req.body;
		console.log(id);
		db.jobs.findOne({_id: id.id}, function(err,rows){
			res.send(rows);
		});

	});
	//done

	//load a user by id
	app.post('/loadUserById', function(req,res) {
		var id= req.body;

		db.users.findOne({_id: id.id}, function(err, rows){
			res.send(rows);
		});

	});
	//done
	//upload profile picture
	app.post('/upload', multipartyMiddleware, function(req, res){
		var file = req.files.file;
		var id = req.body.user;


		fs.readFile(file.path, function (err, data) {

			var temp = file.path;
			console.log(temp);
			temp = temp.replace("tmp\\", '\\uploads\\');
			temp = temp +".png";
			var newPath = __dirname + temp;

			fs.writeFile(newPath, data, function (err) {
				if(err) throw err;


				db.users.update({_id:id}, {$set: {profilePicture: temp}}, function(err,result){
					if (err) throw err;
					fs.unlink(file.path, function(e){
						if(!e){
							res.send(true);
						}
					});

				} );
			});

		});

	});
	//done

	//get profile picture data
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
	//done

	//update a user
	app.post('/updateUser', function(req,res){

		var user = req.body;
		db.users.update({_id : user._id}, {$set: user}, function(err, doc){
			if (err) throw err;
			res.send(true);
		} );

	});
	//done

	//Add application to db
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
		db.applications.create(application, function(app){
			db.jobs.update({_id: job._id}, {$set:job}, function(err,docs){
				res.send(app);
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
	//activate a new user
	app.post('/activateUser', function(req,res){
		var user = req.body;
		console.log(user);
		db.users.findOneAndUpdate({activateToken: user.token},{$set:{active: true},$unset: {activateToken:""}}, function(err,doc){
			if(err) console.log(err);
			res.send(doc);
		} );
	});
	//done

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

