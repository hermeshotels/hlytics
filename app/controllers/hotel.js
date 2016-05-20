var express = require('express'),
  router = express.Router(),
  Hotel = require('../models/hotel')();

module.exports = function (app) {
  app.use('/api', router);
};

router.get('/hotels/list', function (req, res, next) {
    Hotel.getHotelShortList(req.user, function(err, hotels){
        if(err) throw err;
        res.json(hotels);
    });
});

router.get('/hotels/:id/bol/conversion/', function(req, res, next){
  Hotel.getHotelBolConversion(req.params.id, function(err, conversion){
    if(err) throw err;
    res.json(conversion);
  });
});

router.get('/hotels/list/active', function(req, res, next){
  Hotel.getActiveHotels(function(err, hotels){
    if(err) throw err;
    res.json(hotels);
  });
});

router.get('/hotels/:id/reservations/list/from/:from/to/:to/date/:datetype', function(req, res, next){
  Hotel.getHotelOccupancy(req.params.id, req.params.from, req.params.to, req.params.datetype, function(err, reservations){
    if(err) throw err;
    res.json(reservations);
  });
});

router.get('/hotels/:id/pace/bookingfrom/:bookingfrom/bookingto/:bookingto/arrivalfrom/:arrivalfrom/arrivalto/:arrivalto', function(req, res, next){
  Hotel.getHotelPace(req.params.id, req.params.bookingfrom, req.params.bookingto, req.params.arrivalfrom, req.params.arrivalto, function(err, reservations){
    if(err) throw err;
    res.json(reservations);
  });
});

/*
Report di produzione della struttura.
Ritorna tutte le prenotazioni attive (O,M) per il periodo selezionato con il relativo importo
complessivo. La somma degli importi equivale al fatturato totale per il periodo richiesto.
*/
router.get('/hotels/:id/production/channel/from/:from/to/:to/:channels?', function(req, res, next){
    Hotel.getChannelProductionPeriod(req.params.id, req.params.channels, req.params.from, req.params.to, function(err, data){
        if(err) throw err;
        res.json(data);
    });
});
