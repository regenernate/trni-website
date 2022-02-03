exports.module = function( terms, order ){

  if(!terms || !terms.sort ) return "";
  if(!order) order = "alpha";

  order = order.toLowerCase();

  switch( order ){
    case "alpha":
      terms.sort()
    break;
    case "zeda":
      terms.sort();
      terms.reverse();
    break;
    default:
      throw new Error( "The order directive of " + order + " is not recognized by the listifier.")
  }
  return "There are " + terms.length + " terms below.</br>" + terms.join("<br \>");
}
/*

Return a list of terms in a list format

*/
