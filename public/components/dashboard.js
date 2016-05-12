jQuery(document).ready(function(){
    
    var startPeriod1 = moment().subtract(30, 'days').format('YYYYMMDD0000');
    var endPeriod1 = moment().format('YYYYMMDD2359');
    
    var startPeriod2 = moment().subtract(60, 'days').format('YYYYMMDD0000');
    var endPeriod2 = moment().subtract(30, 'days').format('YYYYMMDD2359');
    
    console.log(moment().endOf('year').format('YYYYMMDD0000'));
    
    var scope = {
        currentData: null,
        previousData: null,
    }
    
    /*
    Richiedo i dati da oggi meno 30 giorni per mostrarli al cliente.
    */
    superagent.get('/api/hotels/1684/production/channel/from/' + startPeriod1 + '/to/' + endPeriod1)
        .end(function(err, res){
            if(err) console.debug(err);
            
            scope.currentData = res.body;
            
            //set dashboard panels
            jQuery('#total-production').text(numeral(res.body.details.reservationTotal).format('$0,0.00'));
            jQuery('#total-adr').text(numeral(res.body.details.periodAdr).format('$0,0.00'));
            
            //setup the graph
            channelAdrGraph();
            
            superagent.get('/api/hotels/1684/production/channel/from/' + startPeriod2 + '/to/' + endPeriod2)
                .end(function(err, res){
                    if(err) console.debug(err);
                    scope.previousData = res.body;
                    //Ricavo i valori di variazione percentuale del totale prenotazioni e ADR
                    percentualDifference();
                    console.log(scope);
                    
                    if(scope.totalDifference > 0){
                        jQuery('#total-variation').html('<i class="streamline-trending-up"></i> ' + numeral(scope.totalDifference / 100).format('0.00%') + ' mese precendete.');
                        jQuery('#total-variation').addClass('text-success');
                    }else{
                        jQuery('#total-variation').html('<i class="streamline-trending-down"></i> ' + numeral(scope.totalDifference / 100).format('0.00%') + ' mese precendete.');
                        jQuery('#total-variation').addClass('text-danger');
                    }
                    
                    if(scope.adrDifference > 0){
                        jQuery('#adr-variation').html('<i class="streamline-trending-up"></i> ' + numeral(scope.adrDifference / 100).format('0.00%') + ' mese precedente.');
                        jQuery('#adr-variation').addClass('text-success');
                    }else{
                        jQuery('#adr-variation').html('<i class="streamline-trending-down"></i> ' + numeral(scope.adrDifference / 100).format('0.00%') + ' mese precedente.');
                        jQuery('#adr-variation').addClass('text-danger');
                    }
                });
    
        });
        
    
        
    function channelAdrGraph(){
        //La funzione è necessaria per formattare il valore degli ADR nel dato necessario
        //ad Hightcarts per la crezione del grafico
        var adrData = adrLookup();
        jQuery('#channel-adr-chart').highcharts({
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: 'Produzione Canali con ADR'
            },
            xAxis: [{
                categories: scope.currentData.details.channelList,
                crosshair: true
            }],
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value}',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                title: {
                    text: 'ADR',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                }
            }, { // Secondary yAxis
                title: {
                    text: 'Prenotazioni',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                labels: {
                    format: '{value}',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                opposite: true
            }],
            tooltip: {
                shared: true
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                x: 120,
                verticalAlign: 'top',
                y: 100,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
            },
            series: [{
                name: 'Prenotazioni',
                type: 'column',
                yAxis: 1,
                data: adrData.channelTotals,
                tooltip: {
                    valueSuffix: ''
                }

            }, {
                name: 'ADR',
                type: 'spline',
                data: adrData.channelAdr,
                tooltip: {
                    valueSuffix: '€'
                }
            }]
        });
    }
    
    function adrLookup(){
        
        var adrFormat = {
            channelTotals: [],
            channelAdr: []
        }
        
        jQuery.each(scope.currentData.details.channelList, function(key, value){
            adrFormat.channelTotals.push(scope.currentData.details.channels[value].total);
            adrFormat.channelAdr.push(scope.currentData.details.channels[value].adr);      
        });
        
        return adrFormat;
    }
    
    function percentualDifference(){
        scope.totalDifference = ((scope.currentData.details.reservationTotal - scope.previousData.details.reservationTotal) / scope.previousData.details.reservationTotal) * 100;
        scope.adrDifference = ((scope.currentData.details.periodAdr - scope.previousData.details.periodAdr) / scope.previousData.details.periodAdr) * 100;
    }
    
});