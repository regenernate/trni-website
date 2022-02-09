
require('dotenv').config();

const DOMAIN_OVERRIDE = process.env.DOMAIN_OVERRIDE || "hshf";

//domain lock so users are less likely to just add tons of domains without thinking and testing
//this is a feature of the server, not a domain switching station
var domains = {
  regenernate:"regenernate",
  theregenernativeinstitute:"trni",
  regenernativelandmanagement:"rlm",
  thewholeofregenerative:"wor",
  'farmstead-design-build':"fdb",
  'software-design-build':"sdb",
  'regenernativedesign':"rgd"
};

const http = require('http');
const fs = require('fs');

const hostname = process.env.BIND_IP || process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;
const toolspath = "./tools";
var home = "homepage";

var page_index = {};
var filename_index = {
  homepage_regenernate:__dirname+'/regenernate.html',
  homepage_trni:__dirname+'/the_regenernative_institute.html',
  homepage_rlm:__dirname+'/regenernative_lm.html',
  homepage_wor:__dirname+'/whole_of_regen.html',
  homepage_fdb:__dirname+'/farmstead_db.html',
  homepage_sdb:__dirname+'/software_db.html',
  homepage_rgd:__dirname+'/regenernativedesign.html',
  schedule_a_consult:__dirname+'/schedule_a_consult.html',
  preconsult_questionert:__dirname+'/preconsult_questionert.html',
  educational_consult:__dirname+'/educational_consult.html',
  definitions:__dirname+"/templates/definition.html",
  how_do_i_use_this:__dirname+"/subpages/how_do_I_use_this.html",
  who_did_this:__dirname+"/subpages/who_did_this.html",
  why_do_this:__dirname+"/subpages/why_do_this.html",
  the_practice:__dirname+"/subpages/the_practice.html",
  the_principles:__dirname+"/subpages/the_principles.html",
  whos_responsible:__dirname+"/subpages/whos_responsible.html"
};

function reloadPage( v ){
  page_index[ v ] = "";
  fs.readFile(filename_index[ v ],function (err, data){
    if( err ) throw new Error(err);
    //insert header using headerer tool
    let d = data.toString();
    if( d && !page_index[ v ] ){ // this should only be entered on the FIRST data chunk
      let h = require('./tools/headerer.js');
      let content_start = d.split( h.start_tag );
      if( content_start.length == 2 ){
        let content_end = content_start[1].split(h.end_tag);
        d = content_start[0] + h.makeHeader(content_end[0]) + content_end[1];
      }else{
        console.log("This one don't have no header ... ( server.js ).");
        //d remains unchanged
      }
    }
    page_index[ v ] += d;
  });
}

//bootstrap initial indices of pages
for( let i in filename_index ){
  reloadPage( i );
}
/*
fs.watch( filename_index[ home ], ( eventType, filename ) => {
  if( eventType.toLowerCase() == "change" ){
      reloadPage( home );
  }
});
*/
//add listener to homepage for auto-refresh???


const server = http.createServer((req, res) => {
  res.statusCode = 200;

  if( !req.headers.accept ) req.headers.accept = "text/html";

  //serve images first
  if( req.url === '/favicon.ico' || req.headers.accept.substr(0,5).toLowerCase() == 'image' ){
    var filename = __dirname+'/images'+req.url;
    //console.log("image ... " + req.url );
    // This line opens the file as a readable stream
    var readStream = fs.createReadStream(filename);
    // This will wait until we know the readable stream is actually valid before piping
    readStream.on('open', function () {
      // This just pipes the read stream to the response object (which goes to the client)
//      console.log("reading :: " + filename);
      if( req.url == '/favicon.ico' ){
        res.writeHead(200, { 'Content-Type':'image/x-icon' } );
      }else{
        res.writeHead(200, { 'Content-Type':'image/*' } );
      }
      readStream.pipe(res);
    });
    // This catches any errors that happen while creating the readable stream (usually invalid names)
    readStream.on('error', function(err) {
      res.writeHead(400)
//      console.log("There was a failure reading :: " + filename + " :: " + err );
      res.end();
    });
    readStream.on('complete', function(done){
      res.end();
    })
  }else if( req.url.substr(-3) === "css" ){ //these are css requests
//      console.log("its css ! " +req.url)
    var filename = __dirname+req.url;
    fs.readFile(filename,function (err, data){
      res.writeHead(200, {'Content-Type': 'text/css','Content-Length':data.length});
      res.write(data);
      res.end();
    });
  }else{ //if not an image or css ...
    console.log("HOST :: " + req.headers.host);
    //get the requesting domain extension for proper routing
    let d = req.headers.host.split(".");
    if( d[0] == "www" ) d = d[1];
    else d = d[0];

    //getting the domain so we know what content to serve
    //don't forget to add your new domains to the domain lock at top of page

    let de = domains[ d ] || DOMAIN_OVERRIDE;

    //console.log("ROUTING TO :: " + de );

    let p = req.url.substr(1).split(".")[0].toLowerCase().split("/"); //get just the page name - assumes a leading "/" and works with .html extension or without
    let pagename = p[0];
    let subpath = p[1] || "";
    //console.log("Looking for page :: " + pagename + " in " + visiting );
    if( filename_index.hasOwnProperty( de ) ){ //peel off known 404 domains
      res.writeHead(200, {'Content-Type': 'text/html','Content-Length':page_index[de].length });
      res.write( page_index[de] );
      res.end();
    }else if( pagename === '' || pagename === 'index' ){ //peel off the root domain homepage requests for next
      //hereify
      let t = require(toolspath + '/putyouhereifier.js').module();
      //insert herification data
      t = page_index[ home + "_" + de ].split("<hereify />").join(t);
      //add any lists needed by this page
      t = listify(t);
      //return the page contents
      res.writeHead(200, {'Content-Type': 'text/html','Content-Length':t.length });
      res.write(t);
      res.end();
    }else if( pagename == "definitions" ){
      //insert the info
      let t = page_index[pagename];
      subpath = subpath.toLowerCase();
      t = t.split("{{term}}").join(subpath);
      if( subpath && definitions_list[ subpath ] ){
        //insert the various templated infos
        let tpi = definitions_list[ subpath ];
        for( let i in tpi ){
          t = t.split("{{" + i + "}}").join(tpi[i]);
        }
        //now replace all versions of known terms with links to that term
        for( let i in terms ){
          if( terms[i] != subpath ){
            t = t.split( terms[i] ).join('<a href="./' + terms[i] + '">' + terms[i] + '</a>');
          }
        }
      }//else return term not known, or link to websters? link to wikipedia, link to ...
      res.writeHead(200, {'Content-Type':'text/html', 'Content-Length':t.length})
      res.write(t);
      res.end();
    }else if( filename_index.hasOwnProperty( pagename ) ) { //this is a known page on a root domain, not the homepage, ( with a template to display )
      //find the template to run
      let t = page_index[ pagename ];
      let r = "/";
      if( subpath ) r += subpath;
      t = t.split("<returnificate-me />").join(r);
      t = listify(t);
      res.writeHead(200, {'Content-Type':'text/html', 'Content-Length':t.length})
      res.write(t);
      res.end();
    }else{ //these are requests we don't yet handle
      console.log("OOPS !!!! it isnt css or a known page in server.js ( towards the end )" + req.url);
      res.writeHead(200, { 'Content-Type':'text/plain' })
      res.end("Hmmm ... we're not sure what you're looking for. You requested :: " + req.url + " which does not yet have routing defined.");
//      throw new Error("Oops, this shouldn't have happened!");
    }
  }
});

/** functionality added for whole of regen **/
var terms=require('./data/terms.json').terms;
var definitions_list =require('./data/definitions.json').terms;

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

//console.log(definitions_list);

function listify( content ){
  let t = content.split("<listify ");
  let r = ""; //initializing return variable
  for( let i=0; i<t.length; i++){
    if(i%2 == 1){
      //pull the order desired out of the tag
      let order = t[i].substring(0, t[i].indexOf("/>")-1);
      r += require(toolspath + '/listifier.js').module( terms, order, "./definitions/");
      r += t[i].substr( t[i].indexOf(">") + 1);
    }else{
      r += t[i]
    }
  }
  return r;
}

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
