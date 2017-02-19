var levelup = require('levelup');
var request = require('request');
var logdb = require('..');

var db = logdb(levelup('./mydb',{valueEncoding:'json'}));

db.append('1',{'kkkk':'1','yyyy':5},function(err) {
});

db.createReadStream().on('data',function(data) {
  console.log(JSON.stringify(data,null,2));
});
