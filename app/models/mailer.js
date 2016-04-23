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

module.exports ={

    sendMail: function(template,userID,arg, cb){

        var args = arg;

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
                   var args = {};
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

                break;
            }
            case 'applicationWithdrawn':{

                break;
            }
            case 'rateTalent':{

                break;
            }
            case 'rateEmployer':{

                break;
            }
            case 'ratedTalent':{

                break;
            }
            case 'ratedEmployer':{

                break;
            }
            case 'offerAccepted':{

                break;
            }
            case 'interviewAccepted':
            {

                break;
            }
            case 'welcomeTalent':{

                break;
            }
        }




        }

};