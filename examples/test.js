var levelup = require('levelup');
var logdb = require('..');

var db = logdb(levelup('./mydb',{valueEncoding:'json'}));

db.put('testkey1',{'kkkk':9,'yyyy':5},function(err) {
});


db.ensureLogStream(function() {
  console.log('end ensureLog');
});



var count =0;
db.createLogStream().on('data',function(data) {
  count++;
 // console.log(JSON.stringify(data.key));
}).on('end',function() { 
  console.log('log entries',count);
  count_db(function(total) {
    console.log('db  entries',total);
  });
});


var count_db = function(cb) {
  var total = 0;
  db.createReadStream().on('data',function(data) {
    total++;
  }).on('end',function() {
    cb(total);
  });
};


/*
db.dropLog(function(_current,_log) {
  console.log(_current,_log);
});
*/

/*
db.createReadStream().on('data',function(data) {
  console.log(JSON.stringify(data,null,2));
});
*/
