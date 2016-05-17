var express = require('express'),
  router = express.Router(),
  User = require('../models/user')();

module.exports = function (app) {
  app.use('/api/users', router);
};

router.post('/add/hotel', function (req, res, next) {
	User.addHotel(req.user.id, req.body.hotelid, function(err, result){
        if(err) throw err;
        res.json(result);
    })
});

router.get('/:id/structures', function(req, res, next){
  User.getUserStructures(req.user.id, function(err, result){
    if(err) throw err;
    res.json(result);
  })
})
