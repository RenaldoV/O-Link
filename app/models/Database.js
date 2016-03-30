
var mongoose = require('mongoose'), Schema = mongoose.Schema;
var passwordHash = require('password-hash');

/*usage

var hashedValue = passwordHash.generate(String);
var booleanValue = passwordHash.verify(Pass, hashValue);

 */
var db = mongoose.connection;
mongoose.connect('mongodb://test:test@ds060968.mongolab.com:60968/olink', function(e) {});



db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
	console.log("Connection to database was successful.");

});

var jobSchema = new Schema({post:{postDate: {type: Date, default: Date.now}, category: String}}, {strict:false});
var idSchema = new Schema({}, {strict:false});
var applicationSchema = new Schema({jobID: {type: String, ref: 'jobs'},studentID: {type: String, ref: 'users'}, employerID : {type: String, ref: 'users'}}, {strict:false});
var notificationSchema = new Schema({jobID: {type: String, ref: 'jobs'},applicationID:{type: String, ref: 'applications'},dateTime: {type: Date, default: Date.now}}, {strict:false});

var jobModel = mongoose.model('jobs', jobSchema);
var appModel = mongoose.model('applications', applicationSchema);
var userModel = mongoose.model('users', idSchema);
var notificationModel = mongoose.model('notifications', notificationSchema);


function activate(token, callback){
	userModel.findOneAndUpdate({activateToken: token},{$set:{active: true},$unset: {activateToken:""}}, function(err,doc){
		if(err) console.log(err);
		callback(doc);
	} );
}

function getModel(colName){
	switch(colName){
		case "jobs": return jobModel;
			break;
		case "applications": return appModel;
			break;
		case "users": return userModel;
			break;
		case "notifications": return notificationModel;
			break;
		}
	}


function addNotification(data, callback){
	insertDocument('notifications',data,function(res,notification){
		return callback(res);
	});
}

function getNotifications(query, callback)
{

	var col = notificationModel;
	var data;

	col.find(query).exec(function (err, docs) {

		data = docs;
		callback(data);
	});

}

function getStudentApplications(query, callback)
{

	var col = appModel;
	var data;

	col.find(query).where('status').ne('Completed').populate('jobID').exec(function (err, docs) {

		data = docs;
		callback(data);
	});

}

function getEmployerApplicants(query, callback)
{

	var col = appModel;
	var data;

	col.find(query).where('status').ne('Completed').populate('jobID').populate('studentID').exec(function (err, docs) {

		data = docs;
		callback(data);
	});

}

function getCompletedApplicants(query, callback)
{

	var col = appModel;
	var data;

	col.find(query).populate('jobID').populate('studentID').exists('studentRating', false).exec(function (err, docs) {

		data = docs;

		callback(data);
	});

}

function getJobHistory(query, callback)
{

	var col = appModel;
	var data;

	col.find(query).populate('jobID').where('status').equals('Completed').exec(function (err, docs) {

		data = docs;
		console.log(data);
		callback(data);
	});

}

function getCompletedApplications(query, callback)
{

	var col = appModel;
	var data;

	col.find(query).populate('jobID').populate('employerID').exists('employerRating', false).exec(function (err, docs) {

		data = docs;
		console.log(data);
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

	col.find({},{},function (err, docs) {

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

function getCollectionByArr(colName, field, arr, arr2, callback)
{

	var col = getModel(colName);
	var data;


	col.find().where(field).in(arr).where('post.timePeriod').in(arr2).exec(function (err, docs) {

		data = docs;
		callback(data);
	});

}

 function insertDocument(colName, doc, callback)
{
	var col = getModel(colName);

	var insert = new col(doc);
	console.log(insert);
	insert.save(function (err, doc) {
		if(err){console.log("Save failed"); throw err;}
		else {

			return callback({id: doc._id});
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
	getOneByReset: function(data,cb){
		getOne('users', data, function(res){
			return cb(res);
		});
	},
	insert: function(data, table, cb){

		insertDocument(table, data,function(result){
			return cb(result);
		});
	},
	updateUser: function(query, setData, cb) {
		console.log(query);
		setData.passwordHash = passwordHash.generate(setData.passwordHash);
		update("users", query, setData, function (err, res) {
			return cb(err,res,setData);
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
	getByArr: function(table, field, arr, arr2, cb){
		getCollectionByArr(table, field, arr, arr2, function(res){
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

					return cb(true);
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
	getCompletedApplicants: function(id, cb){
		getCompletedApplicants({employerID: id, status:"Completed"}, function(res) {
			return cb(res);
		});
	},
	getJobHistory: function(query, cb){

		getJobHistory(query, function(res) {
			return cb(res);
		});
	},
	getCompletedApplications: function(id, cb){
		getCompletedApplications({studentID: id, status:"Completed"}, function(res) {
			return cb(res);
		});
	},
	getJobApplicants: function(id, cb){
		getEmployerApplicants({jobID: id}, function(res) {
			return cb(res);
		});
	},
	addNotification: function(data, cb){
		addNotification(data, function(res){
			return cb(res);
		});
	},
	loadNotifications: function(id, cb){
		getNotifications( {userID: id, seen: false}, function(res){
			return cb(res);
		});
	},
	activateUser: function(token, cb){

		activate(token, function(doc){
			cb(doc);
		});
	},
	remove: function(colName, id, cb){
	var col = getModel(colName);
	col.remove({_id : id}, function(res){
		return cb(res);
	});
}

};
