var mongoose = require('mongoose'), Schema = mongoose.Schema;
mongoose.connect('mongodb://seanTest:Databse1@ds060968.mongolab.com:60968/olink');


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
	console.log("Connection to database was successful.");

});

var jobSchema = new Schema({id : String}, {strict:false});
var idSchema = new Schema({id : Number}, {strict:false});


var col;
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
 function insertDocument(colName, doc, callback)
{
	var schema = idSchema;
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
	callback(0);
}

//change
function updateDocument(colName, id, updateInfo )
{
	idSchema.set('collection', colName);
	col = mongoose.model(colName, idSchema);


	col.findOne({id:id}, function(err,user)
	{
		if(err){return next(err)}
		user.projectID.push(projID);
		user.save(function(err){
			if(err) return next(err);
		});
	});

}


//change to mongoDB
function remove(table, where, cb){
	db.query('DELETE from ' + table + ' WHERE ?' ,where, function(err, result) {
		if(!err){

			return cb(result);

		}
		else throw err;
	});

}


module.exports = {

	insert: function(data, table, cb){

		insertDocument(table, data,function(result){
			return cb(result);
		});
	},
	update: function(data, table, where, cb) {

		//
	}
	,
	selectAll: function(collection,cb)
	{
		getCollection(collection,function(res){
			return cb(res)
		});
	},
	checkLogin: function(email, password, table ,cb){

		//
	},
	getUser: function(email, table, cb){
		//
	},
	getJobsByCategory: function(category, cb){
		//
	}

};
