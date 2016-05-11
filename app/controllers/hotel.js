var express = require('express'),
  router = express.Router(),
  Hotel = require('../models/hotel')();

module.exports = function (app) {
  app.use('/api', router);
};

router.get('/hotels/list', function (req, res, next) {
    Hotel.getHotelShortList(function(err, hotels){
        if(err) throw err;
        res.json(hotels);
    });
});
/*
Report di produzione della struttura.
Ritorna tutte le prenotazioni attive (O,M) per il periodo selezionato con il relativo importo
complessivo. La somma degli importi equivale al fatturato totale per il periodo richiesto.
*/
router.get('/hotels/:id/production/from/:from/to/:to/:channels?', function(req, res, next){
    Hotel.getProductionPeriod(req.params.id, req.params.channels, req.params.from, req.params.to, function(err, data){
        if(err) throw err;
        res.json(data);
    })
});
