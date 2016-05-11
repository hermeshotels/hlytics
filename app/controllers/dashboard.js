var express = require('express'),
  router = express.Router();

module.exports = function (app) {
  app.use('/reserved', router);
};

router.get('/dashboard', function (req, res, next) {
	res.render('reserved/dashboard', {current: 'dashboard'});
});
