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



	app.get('/home', function(req, res) {

		res.sendfile('./public/landing/index.html');

	});
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


				db.users.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(er,user) {
					if (!user) {
						return res.send('error');
					}
		 			var tempUser = user.toJSON();
		 			tempUser.passwordHash = passwordHash.generate(pw.passwordHash);

		 			tempUser.resetPasswordToken = undefined;
		 			tempUser.resetPasswordExpires = undefined;

					db.users.findOneAndUpdate({"_id" : tempUser._id},{$set:tempUser},
						function(err, res1){
							if(!err) {
								return res.send(res1);
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
				var smtpTransport = nodemailer.createTransport(smtpttransport({
					host: "mail.o-link.co.za",
					secureConnection: false,
					port: 25,
					auth: {
						user: "no-reply@o-link.co.za",
						pass: "Olink@Noreply2016"
					},
					tls: {rejectUnauthorized: false}
				}));
				var mailOptions = {
					to: tempUser.contact.email,
					from: 'no-reply@o-link.co.za',
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

				db.users.findOne({'contact.email':user.email},function(err,User){
					if(!User)  return res.send(false);
					
					var tempUser = User.toJSON();
					tempUser.resetPasswordToken = token;
					tempUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour	
 
					db.users.update({"_id" : tempUser._id},tempUser,
					function(err,res){
						done(err,token,User);
					});
					
					res.send(tempUser);
				});
			},
 			function(token, user, done) {

				var tempUser = user.toJSON();
				var smtpTransport = nodemailer.createTransport(smtpttransport({
					host: "mail.o-link.co.za",
					secureConnection: false,
					port: 25,
					auth: {
						user: "no-reply@o-link.co.za",
						pass: "Olink@Noreply2016"
					},
					tls: {rejectUnauthorized: false}
				}));
				var mailOptions = {
					to: tempUser.contact.email,
					from: 'no-reply@o-link.co.za',
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



	//Returns the 10 latest job posts for students
	app.post('/jobFeeder', function(req,res){

		db.jobs.find({}).limit(10).sort('-post.postDate').exec(function(err,rows){
			if(err){

			}
			res.send(rows);
		});

	});
	//done


	//Returns all job posts from logged in employer
	app.post('/myJobFeeder', function(req,res){

		var user = req.body;

		db.jobs.find({employerID: user.id, status: {$ne: "inactive", $ne:"Completed"}}).sort('-post.postDate').exec(function(err,rows){
			if(err){

			}
			res.send(rows);
		});

	});
	//done


	//Gets jobs based on categories and time periods
	app.post('/jobBrowse', function(req,res){

		var temp = req.body;

		console.log(temp);
		db.jobs.find({status:'active'}).where('post.category').in(temp.categories).where('post.timePeriod').in(temp.periods).sort('-post.postDate').populate('employerID').exec(function(err,rows){
			if(rows.length == 0)
			res.send(false);
			else
			res.send(rows);
		});

	});
	//done


	//post a job to database
	app.post('/jobPoster', function(req,res) {

		var job = req.body;

		db.jobs.create(job,function(err, jobi){
			console.log(jobi);
			res.send(jobi);
		});

	});
	//done


	//update job in database
	app.post('/jobUpdate', function(req,res) {

		var job = req.body.job;

db.jobs.findOneAndUpdate({_id:job._id}, {$set:job}, function(err,d){
	if(d){
		db.applications.update({jobID:job._id},{$set:{edited:true, editTime: Date.now()}} , function(err,rows){
			console.log(rows);
			res.send(true);
		});
	}
});





	});
	//done
	//user accepts changes to job
	app.post('/acceptChanges', function(req,res) {

		var app = req.body;



		db.applications.update({_id:app.id},{$unset:{edited:'', editTime: ''}} , function(err,rows){
			console.log(rows);
			res.send(true);
		});



	});
	//done

	//sign in to the app
	app.post('/signin', function(req,res) {
		var user = {};

		for(var key in req.body) {
			user = JSON.parse(key);
		}

		db.users.findOne({'contact.email': user.email, active:true}, function(err,doc){
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

		var user = req.body;
		//add activation token and insert into db
		db.users.find({'contact.email': user.contact.email}, function(err,users){
			if(users.length > 0)
			{
				res.send('email');

			}else

		crypto.randomBytes(20, function(err, buf) {
				var token = buf.toString('hex');
				user.activateToken = token;
				user.passwordHash = passwordHash.generate(user.passwordHash);
				db.users.create(user,function(e,result){
					if(result)
						res.send(result);
					if(result != 'email' && !err){

					var smtpTransport = nodemailer.createTransport(smtpttransport({
						host: "mail.o-link.co.za",
						secureConnection: false,
						port: 25,
						auth: {
							user: "no-reply@o-link.co.za",
							pass: "Olink@Noreply2016"
						},
						tls: {rejectUnauthorized: false}
					}));
					var mailOptions = {
						to: user.contact.email,
						from: 'no-reply@o-link.co.za',
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
		db.jobs.findOne({_id: id.id}).populate('employerID').exec(function(err,rows){
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

		var def = __dirname + "\\uploads\\default.png";
		if(req.body.profilePicture) {
			var path = req.body.profilePicture;
			path = __dirname + path;
		}
		else {
			var path = def;
		}

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
	//done

	//make changes to application
	app.post('/updateApplication', function(req,res){

		var app = req.body;
		console.log(app);
		var id = app._id;
		delete  app._id;

		db.applications.findOneAndUpdate({_id : id},{$set: app}, function(err, app){
			if (err) throw err;
			res.send(true);
		} );

	});
	//done
	//make changes to application
	app.post('/rateStudent', function(req,res){

		var app = req.body;
		console.log(app);
		var id = app._id;
		delete  app._id;
		var user = app.id;
		delete app.id;
		var newRating = app.studentRating;
		db.applications.findOneAndUpdate({_id : id},{$set: app}, function(err, app){
			if (err) throw err;

			db.users.findOne({_id:user}, function(err,us){

				var numRatings = 0;
				if(us.numRatings){
					numRatings = us.numRatings;
				}
				var rating = 0;
				if(us.rating){
					var rating = us.rating;

				}
				var tempRating = roundHalf(((rating * numRatings) + newRating)/++numRatings);
				console.log(tempRating);
				db.users.findOneAndUpdate({_id:us._id}, {$set:{rating:tempRating, numRatings:numRatings}}, function(err, rr){
					res.send(true);
				});

			});

		} );

		} );

	//done
	//make changes to application
	app.post('/rateEmployer', function(req,res){

		var app = req.body;
		console.log("Here: "+app);
		var id = app._id;
		delete  app._id;
		var user = app.id;
		delete app.id;
		var newRating = app.employerRating;
		db.applications.findOneAndUpdate({_id : id},{$set: app}, function(err, app){
			if (err) throw err;

			db.users.findOne({_id:user}, function(err,us){

				var numRatings = 0;
				if(us.numRatings){
					numRatings = us.numRatings;
				}
				var rating = 0;
				if(us.rating){
					var rating = us.rating;

				}
				var tempRating = roundHalf(((rating * numRatings) + newRating)/++numRatings);
				console.log(tempRating);
				db.users.findOneAndUpdate({_id:us._id}, {$set:{rating:tempRating, numRatings:numRatings}}, function(err, rr){
					res.send(true);
				});

			});

		} );

	});
	//done

	//loads applications by student
	app.post('/loadApplications', function(req,res){

		var user = req.body;
		db.applications.find({studentID: user._id}).where('status').ne('Completed').populate('jobID').exec(function (err, docs) {

			res.send(docs);
		});


	});
	//done

	//load applications by employer and populate job IDs
	app.post('/loadApplicationsTo', function(req,res){

		var user = req.body;
		db.applications.find({employerID: user._id}).where('status').ne('Completed').populate('jobID').exec(function (err, docs) {

			res.send(docs);
		});


	});
	//done

	//load applications by employer and populate job and student IDs
	app.post('/loadApplicants', function(req,res){

		var user = req.body;
		db.applications.find({employerID: user._id}).where('status').ne('Completed').populate('jobID').populate('studentID').exec(function (err, docs) {

			res.send(docs);
		});


	});
	//done

	//load applications by job and populate job and student IDs
	app.post('/loadApplicantsByJobId', function(req,res){

		var job = req.body;
		db.applications.find({jobID: job._id}).where('status').ne('Completed').populate('jobID').populate('studentID').exec(function (err, docs) {

			res.send(docs);
		});


	});
	//done

	//load notifications by user
	app.post('/loadNotifications', function(req,res){

		db.notifications.find({userID: req.body.id, seen: false}, function(err, rows){
			res.send(rows);
		});
	});
	//done

	//update a notification to be seen
	app.post('/makeSeen', function(req,res){

		var noti = req.body;
		db.notifications.findOneAndUpdate({_id : noti.id}, {$set: {seen : true}}, function(err, not){
			if (err) throw err;
			res.send(true);
		} );

	});
	//done

	//for ratings, called for employers to rate talent
	app.post('/getRatingDataForEmployer', function(req,res){

		var emp = req.body;

		db.applications.find({employerID: emp.id, status:"Completed", offered:"accepted"}).populate('jobID').populate('studentID').exists('studentRating', false).exec(function (err, rows){
			res.send(rows);
		});


	});
	//done

	//for ratings, called for employers to rate talent
	app.post('/getRatingDataForStudent', function(req,res){

		var student = req.body;

		db.applications.find({studentID: student.id, status:"Completed",offered:"accepted"}).populate('jobID').populate('employerID').exists('employerRating', false).exec(function (err, rows){
			res.send(rows);
		});

	});
	//done

	//loads completed jobs for a employer to review and or repost
	app.post('/loadJobHistory', function(req,res){

		var student= req.body;

		db.jobs.find(req.body).populate('jobID').where('status').equals('Completed').exec(function (err, docs) {

			res.send(docs);
		});

	});
	//done

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

	//remove job
	app.post('/removeJob', function(req,res){
		var id = req.body.id;

		//remove job
		db.jobs.remove({_id: id}, function (err,row) {
			//remove applications
				db.applications.remove({jobID:id}, function(err,rows){
					res.send(row);
				});

			
		});
	});
	//done

	//checks Password on chnges
	app.post('/checkPassword', function(req,res){

		var user = req.body;

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

	//get dashboard statistics
	app.post('/getStats', function(req,res) {


		var user = req.body;
		var stats = {};
		db.users.count({type:'student'}, function(err, c){
			stats.studentCount = c;
			db.users.count({type:'employer'}, function(err, c){
				stats.employerCount = c;
				db.jobs.count({}, function(err, c){
					stats.jobsCount = c;
					if(user.type == 'student'){
						db.applications.count({studentID:user.id}, function(err, c){
							stats.myApplications = c;
							res.send(stats);
						});
					}
					else if(user.type == 'employer') {
						db.jobs.count({employerID: user.id}, function (err, c) {
							stats.myPosts = c;
							res.send(stats);
						});
					}
					else if(user.type == 'guest'){
						res.send(stats);
					}
				});

			});
		});

	});
	//done
	//make offer functionality
	app.post('/makeOffer', function(req,res) {


		var app = req.body;

		db.applications.findOneAndUpdate(app,{$set: {offered:"offered"}}, function(err, doc){
			res.send(doc);
		});

	});
	//done

	//accept offer functionality
	app.post('/acceptOffer', function(req,res) {


		var app = req.body;

		db.applications.findOneAndUpdate(app,{$set: {offered:"accepted", status:"Confirmed"}}, function(err, doc){
			res.send(doc);
		});

	});
	//done

	//decline offer functionality
	app.post('/declineOffer', function(req,res) {


		var app = req.body;

		db.applications.findOneAndUpdate(app,{$set: {offered:"declined", status:"Declined"}}, function(err, doc){
			res.send(doc);
		});

	});

	//done

	//get offer count for employer profile
	app.post('/getOfferCount', function(req, res){

		var user = req.body._id;
		console.log(user);

		db.jobs.count({employerID: user,status:'active'}, function(err, count){
			console.log(count);
			res.send({count:count});
		});

	});
	//done
};

function roundHalf(num) {
	return Math.round(num*2)/2;
}