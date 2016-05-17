var schemas = require('./schemas');
var uuid = require('node-uuid');
var _ = require('lodash');
var bcrypt = require('bcrypt');
var pools = require('../../config/pools');
var utils = require('./db_utils');
var mysql = require('mysql');

var TABLENAME = 'users';

function sanitize(data){
    data = data || {};
    schema = schemas.user;
    return _.pick(_.defaults(data, schema), _.keys(schema));
}

function HashPassword(password){
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

module.exports = function(){
    
    var User = {};
    
    User.comparePassword = function comparePassword(password, hash) {
        return bcrypt.compareSync(password, hash);
    }
    
    User.save = function save(user, callback){
        pools.lyticsPool.getConnection(function openDbConnection(err, client){
            if(err) return callback(err);
            if(typeof(user.id) == 'undefined'){
                user.id = uuid.v4();
                user.password = HashPassword(user.password);
                //Genero la query per la creazione del record
                var builder = utils.buildInsertQuery(user, TABLENAME);
                //Eseguo la query con i parametri generati
                client.query(builder.query, builder.values, function executeQuery(err, result){
                    client.release();
                    if(err) return callback(err);
                    delete user.password;
                    return callback(null, user);
                });
            }else{
                var builder = utils.buildUpdateQuery(user, TABLENAME, 'id');
                client.query(builder.query, builder.values, function executeQuery(err, result){
                    client.release();
                    if(err) return callback(err);
                    delete user.password;
                    return callback(null, user);
                });
            }
        });
    }
    
    User.findById = function findById(id, callback){
         pools.lyticsPool.getConnection(function openDbConnection(err, client){
            client.query('SELECT * FROM ' + TABLENAME + ' WHERE id=?', [id], function executeQuery(err, user){
                client.release();
                if(err) return callback(err);
                return callback(null, user[0]);
            });
        });
    }
    /*
    Richiede l'attivazione di un collegamento UTENTE -> HOTEL
    */
    User.addHotel = function(id, hotelids, callback){
        pools.lyticsPool.getConnection(function openDbConnection(err, client){
            var query = "INSERT INTO user_hotel (user_id, hotel_id, validated) VALUES ";
            var inserts  = [];
            hotelids.split(',').forEach(function(hotelid){
                inserts.push("(" + mysql.escape(id) + "," + mysql.escape(hotelid) + "," + "0)");
            });
            query = query + inserts.join();
            
            client.query(query, function executeQuery(err, result){
                client.release();
                if(err) return callback(err);
                return callback(null, result);
            });
        });
    }
    
    User.findByEmail = function(email, callback){
        pools.lyticsPool.getConnection(function openDbConnection(err, client){
           if(err) return callback(err);
           client.query('select * from ' + TABLENAME + ' where email = ?', [email], function executeQuery(err, user){
              client.release();
              if(err) return callback(err);
              if(user[0]){
                  return callback(null, user[0]);
              }else{
                  return callback(null, false);
              }
           });
        });
    }
    
    User.getUserStructures = function getUserStructures(id, callback){
        pools.lyticsPool.getConnection(function openDbConnection(err, client){
           if(err) return callback(err, null);
           client.query('SELECT * FROM user_hotel uh INNER JOIN users u ON uh.user_id = u.id WHERE uh.user_id = ?', [id], function executeQuery(err, structures){
               client.release();
               if(err) return callback(err, null);
               return callback(null, structures);
           });
        });
    }
    
    return User;   
    
}