var db = require("./models/Database.js");
var errorHandler = require('./errors.js');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty({ uploadDir: './tmp' });
var fs = require('fs');
// Requires controller

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

	app.post('/jobFeeder', function(req,res){

		db.selectAll("jobs", function(rows){

			res.send(rows);
		});
	});

	app.post('/myJobFeeder', function(req,res){

		var user = req.body;

		db.getBy("jobs", {employerID: user.id}, function(rows){

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
	app.post('/upload', multipartyMiddleware, function(req, res){
		var file = req.files.file;
		var id = req.body.user;

		fs.readFile(file.path, function (err, data) {
			// ...
			var temp = file.path;
			temp = temp.replace("tmp\\", '\\uploads\\');
			temp = temp +".png";
			var newPath = __dirname + temp;

			fs.writeFile(newPath, data, function (err) {
				if(err) throw err;


				db.update({_id : id}, 'users', {profilePicture: newPath}, function(err){
					if (err) throw err;
					console.log(newPath);
					fs.unlink(file.path);
					res.send(true);
				} );
			});

		});

	});

	app.post('/getPp', function(req, res){

		var path = req.body.profilePicture;

		fs.readFile(path, function(err,data){
			if(err) throw err;
			var buf = new Buffer(data).toString('base64');
			res.send(buf);
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
		db.insert(application, 'applications', function(err,result){
			db.update({_id: job._id}, 'jobs',job, function(result){
				res.send(result);
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
};