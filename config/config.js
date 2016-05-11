var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'hermeslytics-pure'
    },
    port: process.env.PORT || 3000,
    db: 'mysql://root:302108@localhost/hermeslytics'
  },

  test: {
    root: rootPath,
    app: {
      name: 'hermeslytics-pure'
    },
    port: process.env.PORT || 3000,
    db: 'mysql://localhost/hermeslytics-pure-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'hermeslytics-pure'
    },
    port: process.env.PORT || 3000,
    db: 'mysql://localhost/hermeslytics-pure-production'
  }
};

module.exports = config[env];
