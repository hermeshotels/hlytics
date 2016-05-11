var express = require('express'),
  router = express.Router(),
  passport = require('passport');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/register', function (req, res, next) {
	res.render('register');
});

router.post('/register', passport.authenticate('local-signup', {
  successRedirect: '/login',
  failureRedirect: '/register',
  failuerFlash: true
}));