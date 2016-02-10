var db = require("./models/Database.js");
var errorHandler = require('./errors.js');

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

	app.post('/jobPoster', function(req,res) {
		var job = {};
		for(var key in req.body) {

			console.log(key);
			job = JSON.parse(key);

		}


		job.employeeID = 1234; //for nowtest

		db.insert(job,'jobs',function(result){
				res.send(result);
		});
	});

	app.post('/addStudent', function(req,res) {
		var student = {};
		for(var key in req.body) {

			console.log(key);
			student = JSON.parse(key);

		}

		student.signupDate = getDate();

		student.lastSeen = getDate();
		db.insert(student,'students',function(result){
			res.send(result);
		});
	});

	app.post('/addEmployer', function(req,res) {
		var employer = {};
		for(var key in req.body) {

			console.log(key);
			employer = JSON.parse(key);

		}

		employer.signupDate = getDate();

		employer.lastSeen = getDate();
		db.insert(employer,'employers',function(result){
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

	app.post('/studentFeeder', function(req,res) {

		db.selectAll("students", function(rows){
			res.send(rows);
		});

	});

};