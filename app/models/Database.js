
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

var jobSchema = new Schema({post:{postDate: {type: Date, default: Date.now}}}, {strict:false});
var idSchema = new Schema({id : Number}, {strict:false});


function getOne(colName, query , callback)
{

	var schema;
	switch(colName){
		case "jobs": schema = jobSchema;
			break;
		default: schema = idSchema;
	}
	schema.set('collection', colName);
	col = mongoose.model(colName, schema);
	var data;

	col.findOne(query,{'_id': 0},function (err, docs) {

		data = docs;
		callback(data);
	});

}

function getCollection(colName, callback)
{

	var schema;
	switch(colName){
		case "jobs": schema = jobSchema;
			break;
		default: schema = idSchema;
	}
	schema.set('collection', colName);
	col = mongoose.model(colName, schema);
	var data;

	col.find({},{'_id': 0},function (err, docs) {

		data = docs;
		callback(data);
	});

}

function getCollectionBy(colName, query, callback)
{

	var schema;
	switch(colName){
		case "jobs": schema = jobSchema;
			break;
		default: schema = idSchema;
	}
	schema.set('collection', colName);
	col = mongoose.model(colName, schema);
	var data;

	col.find(query,{'_id': 0},function (err, docs) {

		data = docs;
		callback(data);
	});

}

 function insertDocument(colName, doc, callback)
{
	var schema;
	switch(colName){
		case "jobs": schema = jobSchema;
			break;
		default: schema = idSchema;
	}
	schema.set('collection', colName);
	col = mongoose.model(colName, schema);
	var insert = new col(doc);

	insert.save(function (err) {
		if(err){console.log("Save failed");}
		else console.log("Saved!");
	});
	callback("Noice");
}
function checkEmail(email,cb){

	getOne('employees', {email:email}, function(res){
		if(res)
		return cb('employees');
	});
	getOne('students', {email:email}, function(res){
		if(res)
			return cb('students');
	});
	return('invalid');
}

function update(colName, params, setData, cb){
	var schema;
	switch(colName){
		case "jobs": schema = jobSchema;
			break;
		default: schema = idSchema;
	}
	schema.set('collection', colName);
	mod = mongoose.model('mod', schema);
	mod.update(params, {$set: setData}, function(res){
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

				return res;

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
			if(tab == 'invalid')
			return cb({valid: false});

			var q = {email : email };
			getOne(tab, q, function(res){
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
	}

};
