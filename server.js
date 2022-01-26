
require('dotenv').config();

const http = require('http');
const fs = require('fs');

const hostname = process.env.BIND_IP || process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;

var home = "homepage";
var consult = "schedule_a_consult";
var questionert = "preconsult_questionert";
var theschool = "educational_consult";

var page_index = {};
var filename_index = {
    homepage:__dirname+'/index.html',
    schedule_a_consult:__dirname+'/schedule_a_consult.html',
    preconsult_questionert:__dirname + '/preconsult_questionert.html',
    educational_consult:__dirname+'/educational_consult.html'
  };

function reloadPage( v ){
  page_index[ v ] = "";
  fs.readFile(filename_index[ v ],function (err, data){
    page_index[ v ] += data;
  });
}

reloadPage( home );
reloadPage( consult );
reloadPage( questionert );
reloadPage( theschool )

fs.watch( filename_index[ home ], ( eventType, filename ) => {
  if( eventType.toLowerCase() == "change" ){
      reloadPage( home );
  }
});
//add listener to homepage for auto-refresh???


const server = http.createServer((req, res) => {
  res.statusCode = 200;

  console.log("request is for ... " + req.url );

  if( req.url === '/favicon.ico' || ( req.headers.accept && req.headers.accept.substr(0,5).toLowerCase() == 'image' ) ){
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
  }else{
    let p = req.url.substr(1).split(".")[0].toLowerCase().split("/"); //get just the page name - assumes a leading "/" and works with .html extension or without
    let pagename = p[0];
    let subpath = p[1] || "";
//    console.log("Looking for page :: " + pagename );
    if( pagename === '' || pagename === 'index' ){ //peel off the homepage requests first
      var toolspath = __dirname + '/tools';
      let t = require(toolspath + '/putyouhereifier.js').module();
      t = page_index[ home ].split("<hereify />").join(t);
      res.writeHead(200, {'Content-Type': 'text/html','Content-Length':t.length });
      res.write(t);
      res.end();
    }else if( filename_index.hasOwnProperty( pagename ) ) { //this is a known page, not the homepage, ( with a template to display )
//      console.log("In else if statement");
      let t = page_index[ pagename ];
      let r = "/index";
      if( subpath ){
        r = "/" + subpath;
      }
//      console.log("pagename :: " + pagename + ' and subpath :: ' + subpath);
      t = t.split("<returnificate-me />").join(r);
      res.writeHead(200, {'Content-Type':'text/html', 'Content-Length':t.length})
      res.write(t);
      res.end();
    }else if( req.url.substr(-3) === "css" ){ //these are css requests
//      console.log("its css ! " +req.url)
      var filename = __dirname+req.url;
      fs.readFile(filename,function (err, data){
        res.writeHead(200, {'Content-Type': 'text/css','Content-Length':data.length});
        res.write(data);
        res.end();
      });
    }else{ //these are requests we don't yet handle
//      console.log("it isnt css " + req.url);
      res.writeHead(200, { 'Content-Type':'text/plain' })
      res.end('Requested :: ' + req.url + " which does not yet have routing defined. ( in the final 'else' of server.js )");
    }
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
