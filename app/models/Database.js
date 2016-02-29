
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
var applicationSchema = new Schema({jobID: {type: String, ref: 'jobs'}}, {strict:false});

var jobModel = mongoose.model('jobs', idSchema);
var appModel = mongoose.model('applications', applicationSchema);


function getStudentApplications(query, callback)
{

	var col = appModel;
	var data;

	col.find(query).populate('jobID').exec(function (err, docs) {

		data = docs;
		callback(data);
	});

}

function getOne(colName, query , callback)
{

	var col;
	switch(colName){
		case "jobs": col = jobModel;
			break;
		default: {var schema = idSchema;
			schema.set('collection', colName);
			col = mongoose.model(colName, schema);}
	}
	var data;

	col.findOne(query,function (err, docs) {

		data = docs;
		callback(data);
	});

}

function getCollection(colName, callback)
{

	var col;
	switch(colName){
		case "jobs": col = jobModel;
			break;
		case "applications": col = appModel;
			break;
		default: {var schema = idSchema;
			schema.set('collection', colName);
			col = mongoose.model(colName, schema);}
	}

	var data;

	col.find({},{'_id': 0},function (err, docs) {

		data = docs;
		callback(data);
	});

}

function getCollectionBy(colName, query, callback)
{

	var col;
	switch(colName){
		case "jobs": col = jobModel;
			break;
		default: {var schema = idSchema;
			schema.set('collection', colName);
			col = mongoose.model(colName, schema);}
	}
	var data;

	col.find(query,function (err, docs) {

		data = docs;
		callback(data);
	});

}

function getCollectionByArr(colName, field, arr, callback)
{

	var col;
	switch(colName){
		case "jobs": col = jobModel;
			break;
		default: {var schema = idSchema;
			schema.set('collection', colName);
			col = mongoose.model(colName, schema);}
	}
	var data;


	col.find().where(field).in(arr).exec(function (err, docs) {

		data = docs;
		callback(data);
	});

}

 function insertDocument(colName, doc, callback)
{
	var col;
	switch(colName){
		case "jobs": col = jobModel;
			break;
		case "applications": col = appModel;
			break;
		default: {var schema = idSchema;
			schema.set('collection', colName);
			col = mongoose.model(colName, schema);}
	}

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
	var col;
	switch(colName){
		case "jobs": col = jobModel;
			break;
		default: {var schema = idSchema;
			schema.set('collection', colName);
			col = mongoose.model(colName, schema);}
	}
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
	}

};
