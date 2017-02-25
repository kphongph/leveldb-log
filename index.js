var sublevel = require('level-sublevel');
var hooks = require('level-hooks');
var diff = require('changeset');
var through2 = require('through2');
var timestamp = require('monotonic-timestamp');

module.exports = logdb;

function logdb(maindb,opts) {
  var db = sublevel(maindb);  
  hooks(db);
  
  if(!db.log) {
    db.log = db.sublevel('log');
    db.log._seq = 0;
  }

  if(!db.createLogStream) {
    db.createLogStream = createLogStream.bind(null,db);
  }

  if(!db.ensureLogStream) {
    db.ensureLogStream = ensureLogStream.bind(null,db);
  }

  if(!db.dropLog) {
    db.dropLog = dropLog.bind(null,db);
  }

  db.hooks.pre(
    { start: '\x00', end: '\xFF' },
    function(change,add,batch) {
      if(change.type === 'put') {
        db.log.put(timestamp(),{
         'key':change.key,
         'changes':diff({},change.value)}
        );
      }
    }
  );
  return db;
}

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

function ensureLogStream(db,cb) {
  var _idx = 0;
  db.createReadStream().on('data',function(value) {
    var _set = [];
    db.logCurrent.get(value.key,function(err,_current) {
      if(!err) {
        _set = diff(_current,value.value);
      } else {
        _set = diff({},value.value);
      }
      if(_set.length > 0) {
        _idx++;
        ts = timestamp();
        db.log.put(ts,{'key':value.key,'changeset':_set});
        db.logCurrent.put(value.key,value.value);
      }
    });
  }).on('end',function() {
    console.log('-ensureLogStream',_idx);
  });
}

function createLogStream(db,options) {
  if(!options) options = {};
  var stream = db.log.createReadStream();
  return stream;
}  
  

