// var http = require('http');
// var url = require('url');
// var fs = require('fs');

// http.createServer(function (req, res) {
//   var q = url.parse(req.url, true);
//   console.log("q=",q)
//   let p=(q.path==='undefined' || q.path===""||q.path==="/")?"/index.html":q.path;
//   var filename = "./build"+p;
//   console.log("q.path=",p)
//   console.log("fileName=",filename)
//   fs.readFile(filename, function(err, data) {
//     if (err) {
//       res.writeHead(404, {'Content-Type': 'text/html'});
//       return res.end("404 Not Found");
//     }  
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     res.write(data);
//     return res.end();
//   });
// }).listen(8080);

try
{
const express = require("express");
const bodyParser = require("body-parser");
const https=require('https');
const fs = require('fs');
const {port,servercert,servercertkey} = require('./src/common/const');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const {logError,logInfo} = require('./server/common/logger');
// console.log(servercert);
// console.log(servercertkey);
const app = express();

app.set("view engine", 'ejs');

//var port = config.serverPort;

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

//app.use(cors());

// console.log("1");
app.use(express.static(path.join(__dirname + '/build')));
// console.log(__dirname);
// console.log(path.join(__dirname + '/build'));
// app.get('*', function(req, res){
//   console.log(req);
//   console.log(path.join(__dirname + '/build/index.html'));
//   res.sendFile(path.join(__dirname + '/build/index.html'));
// });

// Use express's default error handling middleware
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(400).json({ err: err });
});
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname + servercertkey), 'utf8'),
  cert: fs.readFileSync(path.join(__dirname + servercert), 'utf8')
}
// console.log("2");
const server = https.createServer(httpsOptions, app);
// console.log(port);
server.listen(port, () => {
      // console.log('server running at ' + port)
      logInfo(`Listening on port ${port}`);
  })
  
// app.listen(8000, function () {

//   console.log(`Listening on port 8000`);
// });
// console.log("3");
}
catch(e)
{
  console.log(e);
}