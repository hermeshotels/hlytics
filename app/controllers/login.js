var express = require('express'),
  router = express.Router();

module.exports = function (app) {
  app.use('/', router);
};

router.get('/login', function (req, res, next) {
	res.render('login');
});

router.post('/login', passport.authenticate('local-login', {
  failWithError: true
}), function successLogin(req, res, next){
  if(req.xhr) return res.json(201, {message: 'welcome'});
  return res.redirect('/reserved/dashboard');
}, function failLogin(req, res, next){
  if(req.xhr) return res.json(401, {message: 'Login failed'});
  return res.redirect('/login');
});