var sublevel = require('level-sublevel');
var hooks = require('level-hooks');
var deleteRange = require('level-delete-range');
var diff = require('changeset');
var through2 = require('through2');
var timestamp = require('monotonic-timestamp');
var endstream = require('end-stream');


module.exports = logdb;

function logdb(db,opts) {
  // var db = sublevel(maindb);  
  hooks(db);
  
  if(!db.log) {
    db.log = db.sublevel('log');
    db.compact = db.sublevel('compact');
  }

  if(!db.createLogStream) {
    db.createLogStream = createLogStream.bind(null,db);
  }

  /*
  if(!db.dropLog) {
    db.dropLog = dropLog.bind(null,db);
  }
  */

  if(!db.compactLog) {
    db.compactLog = compactLog.bind(null,db);
  }

  db.hooks.pre(
    { start: '\x00', end: '\xFF' },
    function(change,add,batch) {
      if(change.type === 'put') {
        db.log.put(timestamp(),{
          'key':change.key,
          'changes':diff({},change.value)}
        );
      } else {
        if(change.type === 'del') {
          db.log.put(timestamp(),{
            'key':change.key,
            'changes':[],
            'delete':true
          });
        }
      }
    }
  );
  return db;
}

function compactLog(db,options,cb) {
  if(!options) options = {};

  var compact = 0;
  deleteRange(db.compact,{},function(err) {
    var stream = db.log.createReadStream(options);
    stream.pipe(endstream(function(chunk,callback) {
      compact++;
      chunk.value.delete = chunk.value.delete?chunk.value.delete:false;
    //  console.log('>compact',chunk.key,chunk.delete);
      if(!chunk.value.delete) {
        db.compact.put(chunk.value.key,{
          'ts':chunk.key,
          'changes':chunk.value.changes},callback);
      } else {
        db.compact.del(chunk.value.key,callback);
      }
    })).on('finish',function() {
      deleteRange(db.log,options,function(err) {
        var ins = db.compact.createReadStream();
        ins.pipe(endstream(function(chunk,callback) {
          compact--;
     //     console.log('<log',chunk.key);
          db.log.put(chunk.value.ts,{
            key:chunk.key,
            changes:chunk.value.changes
          },callback);
        })).on('finish',function(err) {
           cb(err,compact);
        })
      });
 });
  });

}

/*
function dropLog(db,cb) {
  var dropLog=0;
  var logStream = db.log.createKeyStream();
  logStream.pipe(through2.obj(function(chunk,enc,callback) {
    dropLog++;
    db.log.del(chunk,callback);
  })).on('finish',function() {
    cb(dropLog);
  });
}
*/

function createLogStream(db,options) {
  if(!options) options = {};
  var stream = db.log.createReadStream(options);
  return stream;
}  
  

