var levelup = require('levelup');
var logdb = require('..');

var db = logdb(levelup('./timedb',{valueEncoding:'json'}));

function run() {
  var now = new Date();
  db.put('current',{
    'date':now.getDate()+':'+now.getMonth(),
    'time':''+now.getHours()+':'+now.getMinutes(),
    's':''+now.getSeconds(),
    'ms':''+now.getMilliseconds()
  },function(err) {
    readLog();
    console.log('put',now);
  });
}

function readLog(cb) {
  var count =0;
  db.createLogStream().on('data',function(data) {
    count++;
    console.log(JSON.stringify(data,null,2));
  }).on('end',function() { 
    console.log('log entries',count);
    db.createReadStream().on('data',function(data) {
      console.log(data);
    });
  });
}

run();

