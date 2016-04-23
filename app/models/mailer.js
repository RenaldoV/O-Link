var nodemailer = require('nodemailer');
var smtpttransport = require('nodemailer-smtp-transport');
var hbs = require('nodemailer-express-handlebars');
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

mailer.use('compile', hbs(options));
mailer.sendMail({
    from: 'no-reply@o-link.co.za',
    to: 'sean.hill.t@gmail.com',
    subject: 'Any Subject',
    template: 'email_body',
    context: {
        variable1 : 'value1',
        variable2 : 'value2'
    }
}, function (error, response) {
    if(error){
        console.log(error);
    }
    console.log('mail sent to ');
    mailer.close();
});

