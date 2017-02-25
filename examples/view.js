var levelup = require('levelup');
var through2 = require('through2');
var diff = require('changeset');
var logdb = require('..');

var db = logdb(levelup('./timedb',{valueEncoding:'json'}));

var memdb = {};

db.createLogStream()
.pipe(through2.obj(function(chunk,enc,callback) {
  var value = diff.apply(chunk.value.changes,{});
  callback(null,{'key':chunk.value.key,'value':value});
}))
.pipe(through2.obj(function(chunk,enc,callback) {
  memdb[chunk.key] = chunk.value;
  callback();
})).on('finish',function() {
  for(var key in memdb) {
    var obj = {};
    obj['key']=key;
    obj['value'] = memdb[key];
    console.log(JSON.stringify(obj));
  }
});

