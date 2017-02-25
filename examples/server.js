var http = require('http');
var url = require('url');

var levelup = require('levelup');
var through2 = require('through2');
var logdb = require('..');

var db = logdb(levelup('./timedb',{valueEncoding:'json'}));

http.createServer(function(req,res) {
  var query = url.parse(req.url,true).query;
  query['limit'] = query['limit']?parseInt(query['limit']):10;
  db.createLogStream(query)
  .pipe(through2.obj(function(chunk,enc,callback) {
    this.push(JSON.stringify(chunk));
    callback(null);
  }))
  .pipe(res);
}).listen(9000);
