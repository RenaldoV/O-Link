
var mongoose = require('mongoose'), Schema = mongoose.Schema;
var passwordHash = require('password-hash');

/*usage

var hashedValue = passwordHash.generate(String);
var booleanValue = passwordHash.verify(Pass, hashValue);

 */
var db = mongoose.connection;
//mongoose.connect('mongodb://test:test@ds060968.mongolab.com:60968/olink', function(e) {});
mongoose.connect('mongodb://localhost:27017/olink', function(e) {});


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



module.exports = {

	jobs: jobModel,
	users: userModel,
	applications: appModel,
	notifications: notificationModel
};
