var sublevel = require('level-sublevel');
var diff = require('changeset');

function logdb(maindb,opts) {
  var db = sublevel(maindb);  
  
  if(!db.append) {
    db.append = append.bind(null,db);   
  }

  if(!db.current) {
    db.current = db.sublevel('current');
  }

  return db;
}

module.exports = function(db,opts) {
  return logdb(db,opts);
}

var append = function(db,key,value) {
  var ts = (new Date()).getTime();
  db.current.get(key,function(err,old) {
    if(err) {
      old = {};
    }
    var _set = diff(old,value);
    if(_set.length > 0) {
      db.put(ts,{'key':key,'changeset':_set});
      db.current.put(key,value);
    }
  });
  // db.(ts,{'key':key
}
