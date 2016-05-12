var express = require('express'),
  router = express.Router();

module.exports = function (app) {
  app.use('/reserved/settings', router);
};

router.get('/profile', function (req, res, next) {
	res.render('reserved/profile');
});