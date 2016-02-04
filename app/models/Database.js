var mysql      =    require('mysql');

var db = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'root',
	database : 'test'
});
db.connect();


/* USAGE
 var db = require('./app/models/Database.js');

 db.dbOperation(params, (cb)function(res){

 res is select return or okay packets

 });

 */


module.exports = {

	select: function(query, table, cb){

			db.query("SELECT " + query + " from " + table, function(err, rows, fields){
				if(!err){

					return cb(rows);
				}
				else throw err;
			});



	},
	insert: function(json, table, cb){


	db.query('INSERT INTO ' + table + ' SET ?', json, function(err, result) {
			if(!err){

				return cb(result);

			}
			else throw err;
		});



	},
	update: function(json, table, where, cb){
		db.query('UPDATE ' + table + ' SET ? WHERE ?' ,[json,where], function(err, result) {
			if(!err){

				return cb(result);

			}
			else throw err;
		});

	},

	delete: function(table, where, cb){
		db.query('DELETE from ' + table + ' WHERE ?' ,where, function(err, result) {
			if(!err){

				return cb(result);

			}
			else throw err;
		});

	}


};
