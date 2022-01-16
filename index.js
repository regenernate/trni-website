const http = require('http');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;

var homepage = "";
var homepage_filename = __dirname+'/index.html';

function reloadHomepage(){
  let oldhomepage = homepage;
  homepage = "";
  fs.readFile(homepage_filename,function (err, data){
    homepage += data;
  });
}

reloadHomepage();

fs.watch(homepage_filename, ( eventType, filename ) => {
  if( eventType.toLowerCase() == "change" ){
      reloadHomepage();
  }
});
//add listener to homepage for auto-refresh???


const server = http.createServer((req, res) => {
  res.statusCode = 200;

  if( req.url === '/favicon.ico' || req.headers.accept.substr(0,5).toLowerCase() == 'image' ){
    if( req.url == '/favicon.ico' ){
      res.writeHead(200, { 'Content-Type':'image/x-icon' } );
    }else{
      res.writeHead(200, { 'Content-Type':'image/*' } );
    }
    var filename = __dirname+'/images'+req.url;
    //console.log("image ... " + req.url );
    // This line opens the file as a readable stream
    var readStream = fs.createReadStream(filename);
    // This will wait until we know the readable stream is actually valid before piping
    readStream.on('open', function () {
      // This just pipes the read stream to the response object (which goes to the client)
      readStream.pipe(res);
    });
    // This catches any errors that happen while creating the readable stream (usually invalid names)
    readStream.on('error', function(err) {
      res.end(err);
    });
    readStream.on('complete', function(done){
      res.end();
    })
  }else{
    if( req.url === '/' || req.url === '/index.html' ){
      var toolspath = __dirname + '/tools';
      let t = require(toolspath + '/putyouhereifier.js').module();
      t = homepage.split("<hereify />").join(t);
      res.writeHead(200, {'Content-Type': 'text/html','Content-Length':t.length });
      res.write(t);
      res.end();
    }else if( req.url.substr(-3) === "css" ){
      console.log("its css ! " +req.url)
      var filename = __dirname+req.url;
      fs.readFile(filename,function (err, data){
        res.writeHead(200, {'Content-Type': 'text/css','Content-Length':data.length});
        res.write(data);
        res.end();
      });
    }else{
      console.log("it isnt css " + req.url);
      res.writeHead(200, { 'Content-Type':'text/plain' })
      res.end('Requested :: ' + req.url );
    }
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
