jQuery(document).ready(function(){
    
    var start = moment().subtract(30, 'days').format('YYYYMMDD0000');
    var end = moment().format('YYYYMMDD2359');
    
    superagent.get('/api/hotels/1684/production/from/' + start + '/to/' + end)
        .end(function(err, res){
            if(err) console.debug(err);
            
            console.log(res.body);
            
            var channelTotals = [];
            var channelAdr = [];
            jQuery.each(res.body.details.channelList, function(key, value){
                channelTotals.push(res.body.details.channels[value].total);
                channelAdr.push(res.body.details.channels[value].adr);
            });
            
            console.log(channelTotals);
            console.log(channelAdr);
            
            
            jQuery('#channel-adr-chart').highcharts({
                chart: {
                    zoomType: 'xy'
                },
                title: {
                    text: 'Produzione Canali con ADR'
                },
                xAxis: [{
                    categories: res.body.details.channelList,
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
                    data: channelTotals,
                    tooltip: {
                        valueSuffix: ''
                    }

                }, {
                    name: 'ADR',
                    type: 'spline',
                    data: channelAdr,
                    tooltip: {
                        valueSuffix: '€'
                    }
                }]
            });
    
    
        });
});