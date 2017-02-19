var sublevel = require('level-sublevel');
var hooks = require('level-hooks');
var diff = require('changeset');

module.exports = logdb;

function logdb(maindb,opts) {
  var db = sublevel(maindb);  
  hooks(db);
  
  if(!db.log) {
    db.log = db.sublevel('log');
  }

  if(!db.createLogStream) {
    db.createLogStream = createLogStream.bind(null,db);
  }

  db.hooks.pre(
    { start: '\x00', end: '\xFF' },
    function(change,add,batch) {
      if(change.type === 'put') {
        var ts = (new Date()).getTime();
        db.get(change.key,function(err,value) {
          if(err) value = {};
          var _set = diff(value,change.value);
          if(_set.length > 0) {
            db.log.put(ts,{'key':change.key,'changeset':_set});
          }
        });
      }
    }
  );
  return db;
}

function createLogStream(db) {
  return db.log.createReadStream();
}  
  

