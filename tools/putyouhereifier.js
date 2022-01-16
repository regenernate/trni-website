const moment = require('moment');

exports.module = function(){

  let t = moment().format('h:mm');
  let a = ( moment().format('a').toLowerCase() == "am" ) ? "morning" : ( t.split(":")[0] < 5 ) ? "afternoon" : "evening";
  let dow = moment().format('dddd');
  let day = moment().format('D');
  let mon = moment().format('MMMM');
  return "<p>Where we are it's " + t + " on a relatively nice " + dow + " " + a + ".</p><p>I think " + mon + " the " + (day - 1) +
   " ... err, maybe the " + day + ".";

}
/*

Where we are it's 7 pm on a nice Sunday evening. What ... May 27th?

Same for you?

Now ... what was it we were talking about?

*/
