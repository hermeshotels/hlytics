/* var fs = require('fs'),
  path = require('path'),
  Sequelize = require('sequelize'),
  config = require('../../config/config'),
  db = {};

var sequelize = new Sequelize(config.db);

fs.readdirSync(__dirname).filter(function (file) {
  return (file.indexOf('.') !== 0) && (file !== 'index.js');
}).forEach(function (file) {
  var model = sequelize['import'](path.join(__dirname, file));
  db[model.name] = model;
});

Object.keys(db).forEach(function (modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize; */

var mysql = require('mysql');
var path = require('path');
var fs = require('fs');

//Carico i model necessari all'applicazione passando i riferimenti ai db
fs.readdirSync(__dirname).filter(function(file) {
  //Salto il file indexjs
  return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file !== 'db_utils.js') && (file !== 'schemas.js');
}).forEach(function(file) {
  //Registro tutti i moduli passando il database come riferimento
  var route = path.join(__dirname, file);
  console.log('[REGISTERING MODULE] - ' + route);
  require(route);
});