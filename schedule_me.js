
module.exports.processRequest=function(data){
  console.log( "yay data :: ", data );
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
