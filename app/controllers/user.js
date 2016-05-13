var express = require('express'),
  router = express.Router(),
  User = require('../models/user')();

module.exports = function (app) {
  app.use('/api/users', router);
};

router.post('/add/hotel/:hotelid', function (req, res, next) {
	User.addHotel(req.user.id, req.params.hotelid, function(err, result){
        if(err) throw err;
        res.json(result);
    })
});