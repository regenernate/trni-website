/** functionality added for whole of regen **/

//uses listifier tool internally!

//load terms and definitions
var { terms } = require('../data/terms.json');
var definitions_list =require('../data/definitions.json').terms;

console.log(terms);



//reorganize based on most similar terms
for( let i in definitions_list ){
  if(!definitions_list[i].hasOwnProperty("relatedness")) definitions_list[i].relatedness = 0;
  let def = definitions_list[i];
  for( let k in {"related_term_1":true, "related_term_2":true, "related_term_3":true} ){
    if( !def[k] ) continue; //no defined related term yet
    console.log( 'looking for ' + def[k] );
    if( !definitions_list[ def[k] ].hasOwnProperty("relatedness") ){  //there is a related term
      definitions_list[ def[k] ].relatedness = 1;
    }else definitions_list[ def[k] ].relatedness++;
  }
}

//try sorting on relation
for( let i=0; i<terms.length-1; i++ ){
  if( definitions_list[ terms[i] ].relatedness < definitions_list[ terms[i+1] ].relatedness ){
    let tmp = terms[i];
    terms[i] = terms[i+1];
    terms[i+1] = tmp;
    i--;
  }
}



console.log(terms);

//add links to all of the alternative forms of words
let checked_index = {};
for( let i in definitions_list ){
  if( checked_index[i] ) continue; //sanity check since we are adding items to the object we are iterating on
  checked_index[i] = true;
  for( let k in {"noun_forms":true, "verb_forms":true, "adjective_forms":true} ){
    if( definitions_list[i][k] ){
      let forms = definitions_list[i][k].split(",");
      for( let j in forms ){
        definitions_list[ forms[j] ] = definitions_list[i];
        checked_index[ forms[j] ] = true;
      }
    }
  }
}

module.exports.fillTerms = function( t, subpath ){
  t = t.split("{{term}}").join(subpath);
  if( subpath && definitions_list[ subpath ] ){
    //insert the various templated infos
    let tpi = definitions_list[ subpath ];
    for( let i in tpi ){
      let input_txt;
      if( ['related_term_1', 'related_term_2', 'related_term_3'].indexOf(i) >= 0 ){
        //insert combo box for now
        input_txt = "<select name='" + i + "' onChange='callMe(this);'>";
        for( let j in terms ){
          input_txt += "<option>" + terms[j] + "</option>";
        }
        input_txt += "</select>";
      }else{
        input_txt = tpi[i]
      }
      t = t.split("{{" + i + "}}").join(input_txt);
    }
    //now replace all versions of known terms with links to that term
    for( let i in terms ){
      if( terms[i] != subpath && terms[i] != "work" ){
        t = t.split( terms[i] ).join('<a href="./' + terms[i] + '">' + terms[i] + '</a>');
      }
    }
  }//else return term not known, or link to websters? link to wikipedia, link to ...
  return t;
}

module.exports.listify = function listify( content ){
  let t = content.split("<listify ");
  let r = ""; //initializing return variable
  for( let i=0; i<t.length; i++){
    if(i%2 == 1){
      //pull the order desired out of the tag
      let order = t[i].substring(0, t[i].indexOf("/>")-1);
      r += require('./listifier.js').module( terms, order, "./definitions/");
      r += t[i].substr( t[i].indexOf(">") + 1);
    }else{
      r += t[i]
    }
  }
  return r;
}
