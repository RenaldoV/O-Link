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
	app.post('/upload', multipartyMiddleware, function(req, res){
		var file = req.files.file;
		var id = req.body.user;

		fs.readFile(file.path, function (err, data) {
			// ...
			var temp = file.path;
			temp = temp.replace("tmp\\", '\\public\\uploads\\');
			temp = temp +".png";
			var newPath = __dirname + temp;
			newPath = newPath.replace("app\\", '');
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
		res.sendfile(path);

	});
};