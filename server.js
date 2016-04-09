// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride 	= require('method-override');
var session 		= require('express-session')
var nodemailer 		= require('nodemailer');
var cookieParser 	= require('cookie-parser');



// configuration ===========================================


//file upload
// Requires multiparty



var port = process.env.PORT || 8080; // set our port
// mongoose.connect(db.url); // connect to our mongoDB database (commented out after you enter in your own credentials)

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(cookieParser());
app.use(session({ secret: 'session secret key' , resave : false , saveUninitialized : false})); //Add secret to session
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

// routes ==================================================
require('./app/routes')(app); // pass our application into our routes

// start app ===============================================
var io = require('socket.io').listen(app.listen(port));
console.log('Magic happens on port ' + port);
exports = module.exports = app; 						// expose app


//io

var db = require("./app/models/Database.js");

io.on('connection', function(socket){
    socket.on('notify', function(data){
        db.notifications.create(data, function(err,res){

            socket.emit('notified'+ data.userID, data, function(err){
                if (err) throw err;
            });
        });
    } );
});

var CronJob = require('cron').CronJob;

//function happens once every hour
new CronJob('00 00 * * * *', function() {
    //check for edited posts that weren't accepted
    db.applications.find({edited:true}, function(err, rows){
        for(var i =0; i < rows.length; i++){
            if(rows[i].editTime + 86400000 >= Date.now() ){
                db.applications.remove({_id:rows[i]._id}, function(err, res){
                   console.log(res);
                });
            }
        }
    });
    console.log('Hourly check');
}, null, true);

//function executes once a day
new CronJob('00 00 00 * * *', function() {
    //check for edited posts that weren't accepted
    db.jobs.find({status:{$ne: 'Completed'}},function(err,rows){
        rows.forEach(function(ro){
            var row = ro.toObject();
            if (row.post.endDate) {
                if(hasFinished(row.post.endDate))
                {
                    db.jobs.findOneAndUpdate({_id:row._id}, {$set:{status: 'Completed'}}, function(err, dox){

                        db.applications.update({jobID: dox._id}, {$set:{status:"Completed"}}, function(err,don){

                        });
                    });
                }

            } else {
                if(hasFinished(row.post.startingDate))
                {

                    db.jobs.findOneAndUpdate({_id:row._id}, {$set:{status: 'Completed'}}, function(err, dox){
                        db.applications.update({jobID: dox._id}, {$set:{status:"Completed"}}, function(err,don){

                        });
                    });
                }

            }
        });

    });
    console.log('Daily check');
}, null, true);


function hasFinished(date){
    if(!date) return false;
    var dateTemp = date.split('/');
    var datearr = [parseInt(dateTemp[0] -1),parseInt(dateTemp[1]),parseInt(dateTemp[2])];
    var now = new Date();

    if(now.getFullYear() > datearr[2]){
        return true;
    }
    if(now.getFullYear() == datearr[2]){

        if(now.getMonth() > datearr[0])
        {
            return true;
        }else if(now.getMonth() == datearr[0])
        {

            if(now.getDate() > datearr[1])
            {

                return true;
            }
        }
    }
        return false;

}
