var express = require('express'),
  db = require('./app/models'),
  config = require('./config/config'),
  session = require('express-session')
  cookieParser = require('cookie-parser'),
  passport = require('passport'),
  bodyParser = require('body-parser');

var app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: 'SECRET', saveUninitialized: true, resave: true}));
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
/*Middleware per il controllo dell'autenticazione*/
app.use('/reserved/*', function(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }else{
    return res.redirect('/login');
  }
});

app.use('/api/*', function(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }else{
    return res.redirect('/login');
  }
});

require('./config/express')(app, config);

app.listen(config.port, function () {
  console.log('Express server listening on port ' + config.port);
});