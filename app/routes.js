var db = require("./models/Database.js");

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

function htmlDateToSQL(date){
	return date.substr(0,10);
}

module.exports = function(app) {

	// server routes ===========================================================
	// handle things like api calls
	// authentication routes

	// frontend routes =========================================================
	// route to handle all angular requests
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html');

	});

	app.post('/jobPoster', function(req,res){
		 console.log('here');
		res.send("shap");
	});

};