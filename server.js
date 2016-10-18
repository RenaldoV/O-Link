// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride 	= require('method-override');
var session 		= require('express-session');
var nodemailer 		= require('nodemailer');
var cookieParser 	= require('cookie-parser');
var mailer = require('./app/models/mailer.js');




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

//test


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
    db.applications.find({edited:true}).populate('jobID').exec(function(err, rows){

        rows.forEach(function(app){
            var str = JSON.stringify(app);
            var newApp = JSON.parse(str);
            // Don't know why the doc has to be converted to string and back to obj... Weird
            //console.log(app.editTime); gives undefined
            var d = new Date();
            //console.log(newApp.editTime + 86400000);
            //console.log(d.getTime());
            if(newApp.editTime + 86400000 <= d.getTime()){
                console.log("removed notification");
                db.applications.remove({_id:newApp._id}, function(err, res){
                    console.log(err);
                });
                db.notifications.remove({jobID: newApp.jobID, type:'jobEdited',userID : app.studentID},function(err,rs){

                });
                db.jobs.update({_id:newApp.jobID},{$pull:{applicants: {$in : [newApp.studentID]}}}, function(err,rs){
                   console.log(err);
                });
                var noti = {
                    userID: newApp.studentID,
                    jobID: newApp.jobID,
                    seen: false,
                    status: 'Expired',
                    type: 'expired',
                    title: newApp.jobID.post.category
                };

                db.notifications.create(noti,function(err, res){
                    //expired
                });
            }
        });
    });

    //remove all seen notifications
    db.notifications.remove({seen: true}, function(err,rs){
        if(err) throw err;
    });

    //remove all applications of offers not accepted in time
    db.applications.find({status:"Provisionally accepted"}).exec(function(err, rows){
        rows.forEach(function(app){
            app = app.toObject();

           if(app.offerDate + 86400000 <= Date.now())
           {
               db.applications.findOneAndUpdate({_id: app._id}, {
                   $set: {status: "Provisionally accepted"}
               }).populate('studentID').populate('employerID').populate('jobID').exec(function (err, ap) {
                   if (err) throw err;

                   var usr = ap.studentID.toObject();
                   var emp = ap.employerID.toObject();
                   var job = ap.jobID.toObject();


                   db.jobs.update({_id: job._id}, {$pull: {'applicants': ap.studentID._id}}).exec(function (ers, res) {
                       if (err) throw err;
                       //console.log("Pull applicants: " + res);
                   });
                   db.notifications.remove({
                       'jobID': ap.jobID._id,
                       'userID': ap.studentID._id,
                       'status': "Provisionally accepted"
                   }, function (err, rs) {
                       if (err) throw err;
                        console.log("Remove Notis: " + rs);
                   });
                   var noti = {
                       userID: ap.studentID._id,
                       jobID: ap.jobID._id,
                       seen: false,
                       status: 'Declined',
                       type: 'status change',
                       title: ap.jobID.post.category
                   };
                   db.notifications.create(noti,function(err, res){
                       //expired
                   });

                   if (ap.studentID.emailDisable == undefined || !ap.studentID.emailDisable) {
                       var args = {};
                       args.name = usr.name.name;
                       args.date = convertDateForDisplay(job.post.startingDate);
                       if (job.post.OtherCategory)
                           args.role = job.post.OtherCategory;
                       else
                           args.role = job.post.category;
                       args.email = usr.contact.email;

                       args.subject = args.role;
                       args.link = 'http://' + "154.66.197.62:8080" + '/browseJobs?timePeriods[]=Once Off&timePeriods[]=Short Term&timePeriods[]=Long Term&categories[]=Assistant&categories[]=Aupair&categories[]=Bartender&categories[]=Coach&categories[]=Cook %2F Chef&categories[]=Delivery Person&categories[]=Host(ess)&categories[]=Internship&categories[]=Model&categories[]=Photographer %2F Videographer&categories[]=Programmer %2F Developer&categories[]=Promoter&categories[]=Retail Worker&categories[]=Tutor&categories[]=Waiter(res)&categories[]=Other';

                       mailer.sendMail('applicationDenied', ap.studentID._id, args, function (err, rr) {
                           console.log("Send email: " + rr);
                       });
                   }
               });
           }
        });
    });
    console.log('Hourly check');
}, null, true);


//function executes once a day
new CronJob('00 00 00 * * *', function() {
dailyCheck();

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

            if(now.getDate() >= datearr[1])
            {

                return true;
            }
        }
    }
        return false;

}

function dailyCheck(){
db.users.update({type:'student'},{$set:{freeApplications:2}}, {multi:true}).exec(function(err,res){
    console.log(res);
});
//remove expired packages
db.users.update({type:'student'},{$pull:{packages:{ expiryDate:{$lt:Date.now()}}}}, {multi:true}).exec(function(err,res){
    console.log(res);
});
//check for edited posts that weren't accepted

db.jobs.find({status: 'active'},function(err,rows){
    rows.forEach(function(ro){
        var row = ro.toObject();
        console.log(row.post.startingDate);
        /* if (row.post.endDate) {
         if(hasFinished(row.post.endDate))
         {
         db.jobs.findOneAndUpdate({_id:row._id}, {$set:{status: 'Completed'}}, function(err, dox){

         db.applications.update({jobID: dox._id, status:'Confirmed'}, {$set:{status:"Completed"}}, {multi:true}, function(err,don){
         db.applications.find({jobID:dox._id, status:'Confirmed'}).populate('studentID').populate('employerID').populate('jobID').exec(function(err, aps) {
         if (err) throw err;
         aps.forEach(function (ap) {


         var usr = ap.studentID.toObject();
         var emp = ap.employerID.toObject();
         var job = ap.jobID.toObject();

         var args = {
         link: 'http://localhost:8080/dashboard/',
         employerName: emp.contact.name,
         talentName: usr.name.name,
         employer: emp.contact.name + " " + emp.contact.surname,
         employer: usr.name.name + " " + usr.name.surname,
         category: job.post.category,
         date: job.post.endDate

         };

         if(emp.emailDisable == undefined || !emp.emailDisable) {
         args.email = emp.contact.email;
         mailer.sendMail('rateEmployer', emp._id, args, function (err, rs) {
         console.log(rs);
         });
         }

         if(usr.emailDisable == undefined || !usr.emailDisable) {
         args.email = usr.contact.email;
         mailer.sendMail('rateTalent', usr._id, args, function (err, rs) {
         console.log(rs);
         });
         }
         });
         });
         });
         });
         }

         } else */
        if(hasFinished(row.post.startingDate))
        {
            var done = [];
            db.jobs.findOneAndUpdate({_id:row._id}, {$set:{status: 'active'}}, function(err, dox){
                db.applications.update({jobID: dox._id, status:'Confirmed'}, {$set:{status:"Completed"}}).exec(function(err,res){
                    if(err) throw err;
                    console.log(res);
                    /*db.applications.find({
                        jobID: dox._id,
                        status: 'Confirmed'
                    }).populate('studentID').populate('employerID').populate('jobID').exec(function (err, aps) {
                        if (err) throw err;
                        var emails = [];
                        aps.forEach(function (ap) {


                            var usr = ap.studentID.toObject();
                            var emp = ap.employerID.toObject();
                            var job = ap.jobID.toObject();

                            var args = {
                                link: 'http://localhost:8080/dashboard/',
                                employerName: emp.contact.name,
                                talentName: usr.name.name,
                                employer: emp.contact.name + " " + emp.contact.surname,
                                talent: usr.name.name + " " + usr.name.surname,
                                category: job.post.category,
                                date: job.post.startingDate

                            };


                            if (usr.emailDisable == undefined || !usr.emailDisable) {
                                args.email = usr.contact.email;
                                if (emails.indexOf(usr.contact.email) > -1) {
                                    mailer.sendMail('rateTalent', usr._id, args, function (err, rs) {
                                        console.log(rs);
                                    });
                                }
                            }
                        });
                    });*/
                });
            });


        }
    });

});
    console.log('Daily check');
}
dailyCheck();

function convertDateForDisplay(date){

    var year = date.substr(6,4);
    var day = date.substr(3,2);
    var month = date.substr(0,2);
    var ret = day+"/"+month+"/"+year;

    return ret;
}