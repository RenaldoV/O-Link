var mysql      =    require('mysql');

var db = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'root',
	database : 'o_link'
});
db.connect();


/* USAGE
 var db = require('./app/models/Database.js');

 db.dbOperation(params, (cb)function(res){

 res is select return or okay packets

 });

 */

function select(query, table, where, cb){

	db.query("SELECT " + query + " from " + table + " WHERE ?", where, function(err, rows, fields){
		if(!err){

			return cb(rows);
		}
		else throw err;
	});



}
function insert(json, table, cb){


	db.query('INSERT INTO ' + table + ' SET ?', json, function(err, result) {
		if(!err){

			return cb(result);

		}
		else throw err;
	});



}
function update(json, table, where, cb){
	db.query('UPDATE ' + table + ' SET ? WHERE ?' ,[json,where], function(err, result) {
		if(!err){

			return cb(result);

		}
		else throw err;
	});

}

function remove(table, where, cb){
	db.query('DELETE from ' + table + ' WHERE ?' ,where, function(err, result) {
		if(!err){

			return cb(result);

		}
		else throw err;
	});

}


module.exports = {

	insertStudent: function(data, cb){

		insert(data, 'students',function(result){
			return cb(result);
		});
	},
	selectAll: function(table,cb)
	{
		select("*",table,'1=1',function(res){
			return cb(res)
		});
	},
	checkLogin: function(email, password, table ,cb){

		select('*',table,{email : email}, function(result){
			if(result[0] != null)
			return cb(true);
			else return cb(false);
		});
	},
	getUser: function(email, table, cb){
		select('*',table,{email : email}, function(result){
			if(result[0] != null)
				return cb(result[0]);
			else return cb(false);
		});
	}



};
