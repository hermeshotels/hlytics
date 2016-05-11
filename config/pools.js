var mysql = require('mysql');
var env = process.env.NODE_ENV || 'development';
var configLytics = require('./databases')['lytics'][env];
var configHermes = require('./databases')['hermes'][env];
//Pool di connessione al DB Lytcs
var _lyticsPool = mysql.createPool({
  connectionLimit: configLytics.connectionLimit,
  host: configLytics.host,
  user: configLytics.user,
  password: configLytics.password,
  database: configLytics.database
});
//Pool di connessione al DB Hermes
var _hermesPool = mysql.createPool({
  connectionLimit: configHermes.connectionLimit,
  host: configHermes.host,
  user: configHermes.user,
  password: configHermes.password,
  database: configHermes.database
});

module.exports = {
    hermesPool: _hermesPool,
    lyticsPool: _lyticsPool
}