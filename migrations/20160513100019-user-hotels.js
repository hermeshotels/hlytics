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
  db.createTable('user_hotel', {
    id: {type: 'int', primaryKey: true, unique: true, autoIncrement: true},
    user_id: {type: 'string', notNull: true, length: 100},
    hotel_id: {type: 'string', notNull: true, length: 100},
    validated: {type: 'boolean', notNull: true, default: false},
    note: {type: 'text', notNull: false}
  }, function(){
    db.addForeignKey('user_hotel', 'users', 'user_hotel_user_id_foreign', {
      'user_id': 'id'
    },
    {
      onDelete: 'CASCADE',
      onUpdate: 'RESTRICT'
    }, callback());
  });
};

exports.down = function(db) {
  return null;
};
