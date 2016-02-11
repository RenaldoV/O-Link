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

		console.log(user);
		db.addUser(user,function(result){
			res.send(result);
		});

	});

	app.post('/studentFeeder', function(req,res) {

		db.selectAll("students", function(rows){
			res.send(rows);
		});

	});

};