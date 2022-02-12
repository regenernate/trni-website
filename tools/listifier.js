//pre_text and post_text can have embedded {{term}}'s where the proper term will be substituted

exports.module = function( terms, order, url_base, pre_text, post_text ){

  if(!terms || !terms.sort ) return "";
  if(!order) order = "alpha";

  if(!pre_text) pre_text="<a href='" + url_base + "{{term}}'>";
  if(!post_text) post_text="</a><br />";

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
      let pre_t = pre_text.split("{{term}}").join(terms[i]);
      let post_t = post_text.split("{{term}}").join(terms[i]);
      rtn += pre_t + terms[i] + post_t;
    }
  }else{
    rtn = terms.join("<br \>")
  }

  return rtn;
}
/*

Return a list of terms in a list format

*/
