var schemas = require('./schemas');
var _ = require('lodash');
var pools = require('../../config/pools');
var utils = require('./db_utils');
var moment = require('moment');

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
                       monthsProduction: {
                         "1": {"total": 0,"nights": 0,"adr": 0},
                         "2": {"total": 0,"nights": 0,"adr": 0},
                         "3": {"total": 0,"nights": 0,"adr": 0},
                         "4": {"total": 0,"nights": 0,"adr": 0},
                         "5": {"total": 0,"nights": 0,"adr": 0},
                         "6": {"total": 0,"nights": 0,"adr": 0},
                         "7": {"total": 0,"nights": 0,"adr": 0},
                         "8": {"total": 0,"nights": 0,"adr": 0},
                         "9": {"total": 0,"nights": 0,"adr": 0},
                         "10": {"total": 0,"nights": 0,"adr": 0},
                         "11": {"total": 0,"nights": 0,"adr": 0},
                         "12": {"total": 0,"nights": 0,"adr": 0}
                       }
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

                 if(channel.total > 0 && channel.nights > 0){
                   channel.adr = channel.total / channel.nights;
                 }else{
                   channel.adr = 0;
                 }
               });

               _.forEach(data.details.monthsProduction, function(month){
                   if(month.total > 0 && month.nights > 0){
                     month.adr = month.total / month.nights;
                   }else{
                     month.adr = 0;
                   }
               })

               return callback(null, data);

            });
        })
    }

    Hotel.getHotelBolConversion = function(id, callback){
      var query = "select COUNT(*) + COALESCE(pra.conteggio, 0) as requests," +
        	"COALESCE(res.conteggio, 0) as reservations " +
        	"FROM pr_richieste as pr " +
        	"LEFT JOIN ( SELECT COUNT(*) as conteggio, rp_ho from pr_richieste_appoggio where rp_ho = ? and rp_data >= '" + moment().startOf('month').format('YYYYMMDD0000') + "' and rp_data <= '" + moment().endOf('month').format('YYYYMMDD2359') + "') as pra ON pr.rp_ho = pra.rp_ho " +
        	"LEFT JOIN ( SELECT COUNT(*) as conteggio, HO_ID from prenotazioni where PR_STATUS IN ('O', 'M') AND ho_id = ? AND PR_DATA_AGG >= '" + moment().startOf('month').format('YYYYMMDD0000') + "' AND PR_DATA_AGG <= '" + moment().endOf('month').format('YYYYMMDD2359') + "') as res ON pr.rp_ho = res.HO_ID " +
        	"WHERE pr.rp_ho = ?";

      pools.hermesPool.getConnection(function openDbConnection(err, client){
        if(err) return callback(err, null);
        client.query(query, [id,id,id], function(err, result){
          if(err) return callback(err, null);
          client.release();
          result[0].conversion = result[0].reservations / result[0].requests * 100;
          return callback(null, result[0]);
        })
      });

    }

    /*
    Ritorna tutte le strutture attive in herems con prenotazioni registrate
    nell'ultimo mese.
    */
    Hotel.getActiveHotels = function(callback){
      var query = "SELECT h.HO_NOME as name, r.ra_numero as starts, r.ra_descrizione as star_desc, l.lc_nome as city " +
      "FROM hotel h " +
      "INNER JOIN prenotazioni p ON h.ho_id = p.ho_id " +
      "INNER JOIN location as l ON h.lc_id = l.lc_id " +
      "INNER JOIN rating as r on h.ho_rating = r.ra_id " +
      "WHERE h.ho_attivo = true " +
      "AND " +
      "p.pr_data_agg >= '" + moment().startOf('month').format('YYYYMMDD0000') + "' " +
      "AND " +
      "p.pr_data_agg <= '" + moment().endOf('month').format('YYYYMMDD2359') + "' " +
      "GROUP BY h.ho_id " +
      "ORDER BY h.ho_nome ASC";

      pools.hermesPool.getConnection(function openDbConnection(err, client){
        if(err) return callback(err, null);
        client.query(query, function(err, result){
          if(err) return callback(err, null);
          client.release();
          return callback(null, result);
        });
      });
    }

    Hotel.getHotelOccupancy = function(id, dateFrom, dateTo, dateType, callback){

      var query = "SELECT p.pr_id, p.pr_datada as dateFrom, p.pr_dataa as dateTo, p.pr_data_agg as booked, DAYOFWEEK(DATE_FORMAT(p.pr_datada, '%Y%m%d')) as weekday, DATEDIFF(DATE_FORMAT(p.pr_dataa, '%Y%m%d'), DATE_FORMAT(pr_datada, '%Y%m%d')) as nights, SUM(s.SC_TOTALE) as total " +
      "FROM prenotazioni p " +
      "LEFT JOIN scorporo as s ON p.PR_ID = s.PR_ID " +
      "WHERE p.ho_ID = ? " +
      "AND p.pr_status in ('O', 'M') ";

      switch (dateType) {
        case "arrival":
          query += "AND pr_datada >= ? and pr_datada <= ?";
          break;
        case "departure":
          query += "AND pr_dataa >= ? and pr_dataa <= ?";
          break;
        case "booking":
          query += "AND pr_data_agg >= ? and pr_data_agg <= ?";
          break;
        default:
          query += "AND pr_data_agg >= ? and pr_data_agg <= ?";
          break;
      }

      query += "GROUP BY p.PR_ID";

      pools.hermesPool.getConnection(function openDbConnection(err, client){
        if(err) return callback(err, null);
        client.query(query, [id, dateFrom, dateTo], function executeQuery(err, reservations){
          if(err) return callback(err, null);
          client.release();
          //Recuperato tutte le prenotazioni per il periodo specificato

          var dates = {};
          _.forEach(reservations, function(reservation){
            var arrival = moment(reservation.dateFrom, 'YYYYMMDD');
            var departure = moment(reservation.dateTo, 'YYYYMMDD');
            var booked = moment(reservation.booked, 'YYYYMMDD');

            //Calcolo la booking window
            reservation.booking_window = arrival.diff(booked, 'days');
            //Calcolo ADR
            reservation.adr = reservation.total / reservation.nights;

            var daydiff = departure.diff(arrival, 'days');
            for(var i = 0; i < daydiff; i++){
              //controllo se il mese esiste
              if(dates[arrival.format('M')]){
              }else{
                dates[arrival.format('M')] = {};
              }

              if(dates[arrival.format('M')][arrival.day()]){
              }else{
                dates[arrival.format('M')]['totalOccupancy'] = 0;
                dates[arrival.format('M')][arrival.day()] = {
                  occupancy: 0,
                  billed: 0,
                  adr: 0
                };
              }
              //controllo se esiste il giorno
              if(dates[arrival.format('M')][arrival.day()]){
                dates[arrival.format('M')]['occupancy'] += 1;
                dates[arrival.format('M')][arrival.day()]['totalOccupancy'] += 1;
                dates[arrival.format('M')][arrival.day()]['billed'] += reservation.adr;
                dates[arrival.format('M')][arrival.day()]['adr'] = dates[arrival.format('M')][arrival.day()]['billed'] / dates[arrival.format('M')][arrival.day()]['occupancy'];
              }else{
                dates[arrival.format('M')][arrival.day()]['totalOccupancy'] = 1;
                dates[arrival.format('M')]['occupancy'] = 1;
                dates[arrival.format('M')][arrival.day()]['billed'] = reservation.adr;
              }

              arrival.add(1, 'days');

            }
          });

          var data = {
            occupancy: dates,
            reservations: reservations
          }

          return callback(null, data);


        });
      });
    }
    return Hotel;

}
