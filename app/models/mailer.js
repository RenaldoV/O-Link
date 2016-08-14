var nodemailer = require('nodemailer');
var smtpttransport = require('nodemailer-smtp-transport');
var hbs = require('nodemailer-express-handlebars');
var db = require('./Database');
var options = {
    viewEngine: {
        extname: '.hbs',
        layoutsDir: 'emails/templates',
        defaultLayout : 'template',
        partialsDir : 'emails/partials/'
    },
    viewPath: 'emails/views/',
    extName: '.hbs'
};

var mailer = nodemailer.createTransport(smtpttransport({
    host: "mail.o-link.co.za",
    secureConnection: false,
    port: 25,
    auth: {
        user: "no-reply@o-link.co.za",
        pass: "Olink@Noreply2016"
    },
    tls: {rejectUnauthorized: false}
}));

function send(template,args, cb){

 mailer.use('compile', hbs(options));
mailer.sendMail({
    from: 'no-reply@o-link.co.za',
    to: args.email,
    subject: args.subject,
    template: template,
    context: args
}, function (error, response) {
    if(error) console.log(error);
    cb(error,response);
    mailer.close();
});
}
/*
var args = {email:'sean.hill.t@gmail.com', subject:'sub', link:'www.google.com'};
send('welcomeTalent',args, function(e,r){
    console.log('test email sent');
});
*/

function isVowel(string){
  var vowels = ['a','e','o','i','u'];
    for(var i = 0; i< vowels.length; i++){
        if(string[0] == vowels[i] || string[0]== vowels[i].toUpperCase())
        {
            return true;
        }
    }
    return false;
};

module.exports ={

    sendMail: function(template,userID,arg, cb){

        var args = arg;
        args.email = 'sean.hill.t@gmail.com';
        switch(template){
            case 'welcomeTalent':{

                args.subject = 'Welcome to O-Link';
                send(template,args,cb);
                console.log(userID + ", "+arg);
                break;
            }
            case 'welcomeEmployer':{

                args.subject = 'Welcome to O-Link';
                send(template,args,cb);
                console.log(userID + ", "+arg);
                break;
            }
            case 'forgotPassword':{

                db.users.findOne({_id:userID}, function(err,row){
                    var res = row.toObject();
                   var args = arg;
                    if(!err){
                        args.email = res.contact.email;
                        args.subject = 'O-Link Password Reset Requested';
                        if(res.type == 'student'){
                            args.name = res.name.name;
                        }
                        else if(res.type == 'employer'){
                            args.name = res.contact.name;
                        }

                        send(template,args,cb);
                    }
                });

                break;
            }
            case 'jobLive':{

                args.subject = 'Job Offer Now Live';
                args.vowel = isVowel(args.category);
                send(template,args,cb);
                break;
            }
            case 'jobEditedEmployer':{

                args.subject = 'O-Link: Edited Job Offer is now Live';
                send(template,args,cb);
                break;
            }
            case 'jobEditedTalent':{

                args.subject = 'O-Link: Edited Job Offer';
                send(template,args,cb);
                break;
            }
            case 'applicationMade':{

                send(template,args,cb);
                break;
            }
            case 'offerMade':{
                send(template,args,cb);
                break;
            }
            case 'offerMadeInterview':{
                send(template,args,cb);
                break;
            }
            case 'applicationDenied':{
                send(template,args,cb);
                break;
            }
            case 'applicationWithdrawn':{

                args.subject = "Withdrawn Application";
                send(template,args,cb);
                break;
            }
            case 'rateTalent':{
                args.subject = "Please Rate your Employee";
                send(template,args,cb);
                break;
            }
            case 'rateEmployer':{
                args.subject = "Please Rate your Employer";
                send(template,args,cb);
                break;
            }
            case 'ratedTalent':{
                send(template,args,cb);
                break;
            }
            case 'ratedEmployer':{
                send(template,args,cb);
                break;
            }
            case 'offerAccepted':{
                args.subject = args.talentName +" has Accepted your Offer";
                send(template,args,cb);
                break;
            }
            case 'interviewAccepted':
            {

                args.subject = args.talentName +" has Accepted your Offer";
                send(template,args,cb);
                break;
            }
            case 'paymentReceived':{
                args.subject = args.package + " Purchased"
                send(template,args,cb);
                break;
            }
        }




        }

};