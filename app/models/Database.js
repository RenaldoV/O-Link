
var mongoose = require('mongoose'), Schema = mongoose.Schema;
var passwordHash = require('password-hash');

/*usage

var hashedValue = passwordHash.generate(String);
var booleanValue = passwordHash.verify(Pass, hashValue);

 */
var db = mongoose.connection;
mongoose.connect('mongodb://test:test@ds060968.mongolab.com:60968/olink', function(e) {console.log(e);});



db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
	console.log("Connection to database was successful.");

});

var jobSchema = new Schema({post:{postDate: {type: Date, default: Date.now}, category: String}}, {strict:false});
var idSchema = new Schema({}, {strict:false});
var applicationSchema = new Schema({jobID: {type: String, ref: 'jobs'},studentID: {type: String, ref: 'users'}}, {strict:false});
var notificationSchema = new Schema({userID: {type: String, ref: 'jobs'},applicationID:{type: String, ref: 'applications'},postDate: {type: Date, default: Date.now}}, {strict:false});

var jobModel = mongoose.model('jobs', jobSchema);
var appModel = mongoose.model('applications', applicationSchema);
var userModel = mongoose.model('users', idSchema);
var notificationModel = mongoose.model('notifications', notificationSchema);



function getModel(colName){
	switch(colName){
		case "jobs": return jobModel;
			break;
		case "applications": return appModel;
			break;
		case "users": return userModel;
			break;
		default: {var schema = idSchema;
			schema.set('collection', colName);
			return mongoose.model(colName, schema);}
	}
}

function addNotification(data, callback){
	insertDocument('notifications')
}

function getStudentApplications(query, callback)
{

	var col = appModel;
	var data;

	col.find(query).populate('jobID').exec(function (err, docs) {

		data = docs;
		callback(data);
	});

}

function getEmployerApplicants(query, callback)
{

	var col = appModel;
	var data;

	col.find(query).populate('jobID').populate('studentID').exec(function (err, docs) {

		data = docs;
		callback(data);
	});

}

function getOne(colName, query , callback)
{

	var col = getModel(colName);
	var data;

	col.findOne(query,function (err, docs) {

		data = docs;
		callback(data);
	});

}

function getCollection(colName, callback)
{

	var col = getModel(colName);

	var data;

	col.find({},{'_id': 0},function (err, docs) {

		data = docs;
		callback(data);
	});

}

function getCollectionBy(colName, query, callback)
{

	var col = getModel(colName);
	var data;

	col.find(query,function (err, docs) {

		data = docs;
		callback(data);
	});

}

function getCollectionByArr(colName, field, arr, callback)
{

	var col = getModel(colName);
	var data;


	col.find().where(field).in(arr).exec(function (err, docs) {

		data = docs;
		callback(data);
	});

}

 function insertDocument(colName, doc, callback)
{
	var col = getModel(colName);

	var insert = new col(doc);
	console.log(insert);
	insert.save(function (err) {
		if(err){console.log("Save failed"); throw err;}
		else {
			console.log("Saved!");
			return callback(true);
		}
	});

}
function checkEmail(email,cb){

	getOne('users', {"contact.email":email}, function(res){

		if(res)
		return cb(true);
		else return cb(false);
	});

}

function update(colName, params, setData, cb){
	var col = getModel(colName);
	col.update(params, {$set: setData}, function(res){
		return cb(res);
	});
}



//remove
//update

module.exports = {

	insert: function(data, table, cb){

		insertDocument(table, data,function(result){
			return cb(result);
		});
	},
	update: function(query, table, setData, cb) {

		update(table, query, setData, function (err, res) {

				return cb(res);

		});
	},
	selectAll: function(collection,cb) {
		getCollection(collection, function ( res) {

					return cb(res);

		});
	},
	checkLogin: function(email, password, cb){

		checkEmail(email, function(res1){
			var tab = res1;
			if(!res1)
			return cb({valid: false});

			var q = {"contact.email" : email };
			getOne('users', q, function(res){
			if(passwordHash.verify(password, res.toObject().passwordHash))
			return cb({valid : true, table: tab, user : res.toObject()});
				else cb({valid: false});
		});
		});
	},

	getBy: function(table, params, cb){
		getCollectionBy(table, params, function(res){
			return cb(res);
		});
	},
	getByArr: function(table, field, arr, cb){
		getCollectionByArr(table, field, arr, function(res){
			return cb(res);
		});
	},

	addUser: function(user, cb){

		checkEmail(user.contact.email, function(res){
			if(res == true) {
				return cb("email");

			}
		else{
				user.passwordHash = passwordHash.generate(user.passwordHash);
				insertDocument('users', user, function(ress){

					return cb(ress);
				});
			}
		});




	},
	getUser: function(email,cb){
		getOne('users', {"contact.email":email}, function(res){
			return cb(res);
		});
	},
	getById: function(table,id,cb){
		getOne(table, {"_id":id}, function(res){
			return cb(res);
		});
	},
	getStudentApplications: function(id, cb){
		getStudentApplications({studentID: id}, function(res) {
			return cb(res);
		});
	},
	getStudentApplicationsBy: function(id, cb){
		getStudentApplications({employerID: id}, function(res) {
			return cb(res);
		});
	},
	getEmployerApplicants: function(id, cb){
		getEmployerApplicants({employerID: id}, function(res) {
			return cb(res);
		});
	},
	getJobApplicants: function(id, cb){
		getEmployerApplicants({jobID: id}, function(res) {
			return cb(res);
		});
	}

};
