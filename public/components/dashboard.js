jQuery(document).ready(function(){
    
    var startCurrent = moment().startOf('year').format('YYYYMMDD0000');
    var endCurrent = moment().endOf('year').format('YYYYMMDD0000');
    
    var startPrevious = moment().startOf('year').subtract(1, 'years').format('YYYYMMDD0000');
    var endPrevious = moment().endOf('year').subtract(1, 'years').format('YYYYMMDD0000');
    
   
    
    var start = moment().startOf('year').format('YYYYMMDD0000');
    var end = moment().startOf('year').format('YYYYMMDD0000');
    
    var scope = {
        currentData: null,
        previousData: null,
        currentMonth: moment().format('M'),
        productionView: 'year',
        adrView: 'year'
    };
    
    /*
    Richiedo i dati da oggi meno 30 giorni per mostrarli al cliente.
    */
    superagent.get('/api/hotels/1684/production/channel/from/' + startCurrent + '/to/' + endCurrent)
        .end(function(err, res){
            if(err) console.debug(err);
            
            scope.currentData = res.body;
            //setup the graph
            channelAdrGraph();
            
            superagent.get('/api/hotels/1684/production/channel/from/' + startPrevious + '/to/' + endPrevious)
                .end(function(err, res){
                    if(err) console.debug(err);
                    scope.previousData = res.body;
                    
                    percentualDifference();
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
        
        jQuery.each(scope.currentData.channelsGroup, function(key, value){
            console.log(key);
            console.log(value);
        })
        
        
        return adrFormat;
    }
    
    jQuery('.change-view').on('click', function(event){
        event.preventDefault();
        scope.productionView = jQuery(this).data('type');
        percentualDifference();
    })
    
    function percentualDifference(){
        
        var productionTotal = 0;
        var adrTotal = 0;
        var productionDifference = 0;
        var adrDifference = 0;
        
        if(scope.productionView == 'year'){
            //Imposto il valore della produzione
            //Calcolo la differenza percentuale con il periodo precedente
            productionTotal = scope.currentData.details.productionTotal;
            adrTotal = scope.currentData.details.totalAdr;
            productionDifference = ((scope.currentData.details.productionTotal - scope.previousData.details.productionTotal) / scope.previousData.details.productionTotal) * 100;
            adrDifference = ((scope.currentData.details.totalAdr - scope.previousData.details.totalAdr) / scope.previousData.details.totalAdr ) * 100;    
        }else{
            productionTotal = scope.currentData.details.monthsProduction[scope.currentMonth].total;
            adrTotal = scope.currentData.details.monthsProduction[scope.currentMonth].adr;
            productionDifference = ((scope.currentData.details.monthsProduction[scope.currentMonth].total - scope.previousData.details.monthsProduction[scope.currentMonth].total) / scope.previousData.details.monthsProduction[scope.currentMonth].total) * 100;
            adrDifference = ((scope.currentData.details.monthsProduction[scope.currentMonth].adr - scope.previousData.details.monthsProduction[scope.currentMonth].adr) / scope.previousData.details.monthsProduction[scope.currentMonth].adr ) * 100;
        }
        
        
        
        jQuery('#total-production').text(numeral(productionTotal).format('$0,0.00'));
        jQuery('#total-adr').text(numeral(adrTotal).format('$0,0.00'));
        
        if(productionDifference > 0){
            jQuery('#total-variation').html('<i class="streamline-trending-up"></i> ' + numeral(productionDifference / 100).format('0.00%') + ' anno precendete.');
            jQuery('#total-variation').addClass('text-success');
        }else{
            jQuery('#total-variation').html('<i class="streamline-trending-down"></i> ' + numeral(productionDifference / 100).format('0.00%') + ' anno precendete.');
            jQuery('#total-variation').addClass('text-danger');
        }
        
        if(adrDifference > 0){
            jQuery('#adr-variation').html('<i class="streamline-trending-up"></i> ' + numeral(adrDifference / 100).format('0.00%') + ' anno precedente.');
            jQuery('#adr-variation').addClass('text-success');
        }else{
            jQuery('#adr-variation').html('<i class="streamline-trending-down"></i> ' + numeral(adrDifference / 100).format('0.00%') + ' anno precedente.');
            jQuery('#adr-variation').addClass('text-danger');
        }
        
    }
    
});