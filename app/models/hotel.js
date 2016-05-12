var schemas = require('./schemas');
var _ = require('lodash');
var pools = require('../../config/pools');
var utils = require('./db_utils');

var TABLENAME = 'hotel';

module.exports = function(){
 
    var Hotel = {};
    
    Hotel.getHotelShortList = function getHotelShortList(callback){
        pools.hermesPool.getConnection(function openDbConnection(err, client){
            if(err) return callback(err);
            client.query('SELECT HO_ID, HO_NOME, HO_INDIRIZZO FROM ' + TABLENAME + ' WHERE HO_ATTIVO = 1 ORDER BY HO_NOME', function executeQuery(err, hotels){
                client.release();
                if(err) return callback(err);
                return callback(null, hotels);
            });
        });
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
                "MONTH(STR_TO_DATE(p.PR_DATA_AGG, '%Y%m%d')) as MONTH " +
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
                       reservationTotal: 0,
                       reservationNights: 0,
                       periodAdr: 0,
                       channels: {},
                       channelList: []
                   },
                   reservations: reservations
               };
               
               for(var i = 0; i < reservations.length; i ++){
                   
                   if(data.details.channelList.indexOf(reservations[i].CA_NOME) < 0){
                       data.details.channelList.push(reservations[i].CA_NOME);
                   }
                   
                   data.details.reservationTotal += reservations[i].TOTALE;
                   data.details.reservationNights += reservations[i].NOTTI;
                   
                   if(data.details.channels[reservations[i].CA_NOME]){
                       data.details.channels[reservations[i].CA_NOME].total += reservations[i].TOTALE;
                       data.details.channels[reservations[i].CA_NOME].nights += reservations[i].NOTTI;
                   }else{
                       data.details.channels[reservations[i].CA_NOME] = {
                           total: reservations[i].TOTALE,
                           nights: 0,
                           adr: 0
                       }
                   }
               }
               
               for(var channel in data.details.channels){
                   if(data.details.channels.hasOwnProperty(channel)){
                       data.details.channels[channel].adr = data.details.channels[channel].total / data.details.channels[channel].nights;
                   }
               }
               
               data.details.periodAdr = data.details.reservationTotal / data.details.reservationNights; 
               
               return callback(null, data); 
            });
        })
    }
    
    return Hotel;
    
}

