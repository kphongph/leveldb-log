var levelup = require('levelup');
var through2 = require('through2');
var diff = require('changeset');
var logdb = require('..');

var db = logdb(levelup('./mydb',{valueEncoding:'json'}));

var memdb = {};

var since = '1487902532817.0059';

db.createLogStream({'start':since})
.pipe(through2.obj(function(chunk,enc,callback) {
  var _current = {};
  if(memdb[chunk.value.key]) {
    _current = memdb[chunk.value.key];
  }
  var _obj = diff.apply(chunk.value.changeset,_current);
  memdb[chunk.value.key] = _obj;
  console.log(chunk.key,chunk.value.key,memdb[chunk.value.key]);
  callback();
}))

