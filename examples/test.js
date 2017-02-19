var levelup = require('levelup');
var request = require('request');
var logdb = require('..');

var db = logdb(levelup('./mydb',{valueEncoding:'json'}));

db.put('1',{'kkkk':8,'yyyy':5},function(err) {
});

db.createLogStream().on('data',function(data) {
  console.log(JSON.stringify(data,null,2));
});

db.createReadStream().on('data',function(data) {
  console.log(JSON.stringify(data,null,2));
});
