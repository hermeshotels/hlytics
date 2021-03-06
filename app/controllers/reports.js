var express = require('express'),
  router = express.Router();

module.exports = function (app) {
  app.use('/reserved', router);
};

router.get('/reports', function (req, res, next) {
	res.render('reserved/reports');
});

router.get('/reports/list/structures', function(req, res, next){
  res.render('reserved/reports/active_structures');
});

router.get('/reports/occupancy/weekly', function(req, res, next){
  res.render('reserved/reports/weekly_occupancy');
});

router.get('/reports/pace', function(req, res, next){
  res.render('reserved/reports/booking_pace');
});
