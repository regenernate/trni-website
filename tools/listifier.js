exports.module = function( terms, order, url_base ){

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

  let rtn = "";
  if(url_base){
    for( let i=0; i<terms.length; i++ ){
      rtn += "<a href='" + url_base + terms[i] + "'>" + terms[i] + "</a><br />";
    }
  }else{
    rtn = terms.join("<br \>")
  }

  return "There are " + terms.length + " terms below.</br>" + rtn;
}
/*

Return a list of terms in a list format

*/
