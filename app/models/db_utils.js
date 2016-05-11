var _ = require('lodash');

var utils = {

  buildInsertQuery: function(data, table){
    var components = dataSplit(data);
    return {
      query: 'INSERT INTO ' + table + '(' + _.join(components.keys, ',') + ')VALUES(' + _.join(components.placeholders, ',') + ')',
      values: components.values
    }
  },
  buildUpdateQuery: function(data, table, primaryKey){
    //recupero il valore della chiave primaria
    var primary = data[primaryKey];
    //elimino la chiave primaria dall'array
    delete data[primaryKey];
    delete data['password'];
    var components = dataSplit(data);
    return{
      query: 'UPDATE ' + table + ' SET ' + _.join(components.keys, '=?,') + '=? WHERE ' + primaryKey + "='" + primary + "'",
      values: components.values
    }
  }

}

function dataSplit(data){
  var keys = Object.keys(data);
  var values = [];
  var placeholders = [];
  keys.forEach(function(key){
    values.push(data[key]);
    placeholders.push('?')
  });

  return {
    keys: keys,
    values: values,
    placeholders: placeholders
  }
}

module.exports = utils;
