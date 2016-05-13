var schemas = require('./schemas');
var _ = require('lodash');
var pools = require('../../config/pools');
var utils = require('./db_utils');

var TABLENAME = 'hotel';

module.exports = function(){

    var Hotel = {};
    /*
    Ritorna la lista di hotel disponibili in herems. Ogni utente ha un set predefinito di hotel collegati al suo account.
    Prima di restituire la lista completa occorre verificare quali ids l'utente ha abilitati per il proprio account.
    */
    Hotel.getHotelShortList = function getHotelShortList(user, callback){
        //Recupero la lista di hotels abilitati
        pools.lyticsPool.getConnection(function openDbConnection(err, client){
            client.release();
            if(err) return callback(err);
            client.query('select GROUP_CONCAT(h.hotel_id) AS allowed from users u INNER JOIN user_hotel h ON u.id = h.user_id WHERE u.id = ? GROUP BY u.id LIMIT 1', [user.id], function executeQuery(err, ids){
                //Ho recuperato la lista di Ids abilitati alla visualizzazione per lo specifico utente.
                //Richiedo ad hermes la lista corrispondente di hotels
                pools.hermesPool.getConnection(function openDbConnection(err, client){
                    client.release();
                    if(err) return callback(err);
                    if(ids.length > 0){
                        //Lutente ha strutture collegate
                        client.query('SELECT HO_ID, HO_NOME, HO_INDIRIZZO FROM ' + TABLENAME + ' WHERE HO_ATTIVO = 1 AND HO_ID IN (?) ORDER BY HO_NOME', [ids[0].allowed.split(',')], function executeQuery(err, hotels){
                        if(err) return callback(err);
                        return callback(null, hotels);
                        });
                    }else{
                        return callback(null, []);
                    }
                });
            })
        })
    }
    /*
    Funzione per la creazione del report generico sulla produzione per periodo.
    La richiesta accetta quattro parametri ID, DATAEFROM, DATETO, CHANNELS
    IL parametro canali è passato per ultimo ed è opzionale, in sua assenza la richiesta restituisce
    il report per tutti i canali disponibili per l'hotel selezionato.
    Nel caso in cui il filtro canali è presente la richiesta restituisce solo i dati relativi ai canali selzionati.
    */
    Hotel.getChannelProductionPeriod = function(id, channels, dateFrom, dateTo, callback){
        pools.hermesPool.getConnection(function openDbConnection(err, client){
            if(err) return callback(err);

            var queryParameters = [];
            if(channels){
                queryParameters = [
                    id, channels.split(','), dateFrom, dateTo
                ];
            }else{
                queryParameters = [
                    id, dateFrom, dateTo
                ];
            }

            var query = "SELECT " +
                "p.PR_ID," +
                "c.CA_NOME," +
                "SUM(s.SC_TOTALE) as TOTALE," +
                "p.PR_NOTTI AS NOTTI, " +
                "MONTH(STR_TO_DATE(p.PR_DATA_AGG, '%Y%m%d')) as MONTH, " +
                "YEAR(STR_TO_DATE(p.PR_DATA_AGG, '%Y%m%d')) as YEAR, " +
                "DAY(STR_TO_DATE(p.PR_DATA_AGG, '%Y%m%d')) as DAY " +
            "FROM " +
                "prenotazioni as p " +
                "LEFT JOIN scorporo as s ON p.PR_ID = s.PR_ID " +
                "INNER JOIN canali as c on p.CA_ID = c.CA_ID " +
            "WHERE " +
                    "p.HO_ID = ? ";
                    //Se si è richiesto un filtro per canale
                    if(channels){
                        query += ' AND p.CA_ID IN (?)';
                    }else{
                        delete queryParameters[channels];
                    }

                    console.log(queryParameters);
                    query += "AND p.pr_Status IN ('O' , 'M') " +
                    "AND p.PR_DATA_AGG BETWEEN ? AND ? " +
                    "GROUP BY p.PR_ID";

            //Eseguo il parse della lista canali per trasformarla in un array

            client.query(query, queryParameters, function(err, reservations){
               client.release();
               if(err) return callback(err);

               var data = {
                   details: {
                       reservationCount: reservations.length,
                       productionTotal: 0,
                       nightsTotal: 0,
                       totalAdr: 0,
                       channelsGroup: {},
                       monthsProduction: {}
                   }
               };

               data.details.productionTotal = _.sumBy(reservations, function(reservation){
                   return reservation.TOTALE;
               });
               //Calcolo il totale dele notti
               data.details.nightsTotal = _.sumBy(reservations, function(reservation){
                   return reservation.NOTTI;
               });
               //Calcolo l'ADR totale di tutto il periodo ( Produzione su Notti )
               data.details.totalAdr = data.details.productionTotal / data.details.nightsTotal;
               //Recupero la lista di canali disponibili
               _.forEach(reservations, function(reservation){
                   //Divisione fatturato per canale
                   if(data.details.channelsGroup[reservation.CA_NOME]){
                       data.details.channelsGroup[reservation.CA_NOME].total += reservation.TOTALE;
                       data.details.channelsGroup[reservation.CA_NOME].nights += reservation.NOTTI;
                   }else{
                       data.details.channelsGroup[reservation.CA_NOME] = {
                           total: reservation.TOTALE,
                           nights: reservation.NOTTI
                       }
                   }

                   if(data.details.monthsProduction[reservation.MONTH]){
                       data.details.monthsProduction[reservation.MONTH].total += reservation.TOTALE;
                       data.details.monthsProduction[reservation.MONTH].nights += reservation.NOTTI;
                   }else{
                       data.details.monthsProduction[reservation.MONTH] = {
                           total: reservation.TOTALE,
                           nights: reservation.NOTTI
                       }
                   }
               });

               _.forEach(data.details.channelsGroup, function(channel){
                   channel.adr = channel.total / channel.nights;
               });

               _.forEach(data.details.monthsProduction, function(month){
                   month.adr = month.total / month.nights;
               })

               return callback(null, data);

            });
        })
    }

    return Hotel;

}

