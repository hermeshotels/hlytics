'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
  db.createTable('users', {
    id: {type: 'string', primaryKey: true, unique: true},
    email: {type: 'string', notNull: true},
    password: {type: 'string', notNull: true},
    active: {type: 'boolean'}
  }, function(){
    db.addIndex('users', 'user_index', 'id', callback);
  });
};

exports.down = function(db, callback) {
  db.dropTable('users', callback);
};
