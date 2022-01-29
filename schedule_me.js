require('dotenv').config();

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.MAILER_FROM,
    pass: process.env.MAILER_PASS
  },
});
transporter.verify().then(console.log).catch(console.error);

module.exports.processRequest=function(data){
  let d = "";
  for( let i in data ){
    d += i + " = " + data[i] + "\n\r";
  }

  transporter.sendMail({
    from: '"tRNi Website" <' + process.env.MAILER_FROM + '>', // sender address
    to: process.env.MAILER_TO, // list of receivers
    subject: "consultation requested", // Subject line
    text: "Consultation was requested with info:\n" + d, // plain text body
  }).then(info => {
    console.log({info});
  }).catch(console.error);

  return("We've got you scheduled for " + data.my_preferred_date + ".");
}


/***  read in the form data

my_email ( optional )
my_phone ( optional )
must have one of the two above, preferably email

my_preferred_date
my_preferred_time

That's it.

***/


//write the form data to a file, for now, replacing any previous requests linked to that email or phone number with this one

//maybe cap how many per day can be saved. If can't be saved because of overlap with others, kick back // WARNING:

//if can be saved, save it to the file

//when possible, email to nate@the regenerative institute ... just look up how to do it since google is hosting our email ... I think ...
