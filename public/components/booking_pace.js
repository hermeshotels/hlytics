jQuery(document).ready(function(){

  var scope = {
    channels: [],
    period1ChannelsProduction: [],
    period2ChannelsProduction: []
  };
  //periodo 1
  superagent('/api/hotels/1922/pace/bookingfrom/201501010000/bookingto/201605172359/arrivalfrom/20160701/arrivalto/20160731')
    .end(function(err, res){
      if(err || !res.ok){
        console.debug(err);
      }

      scope.period1 = res.body;
      //costruisco le serie per il garfico
      for(var channel in res.body.channelsGroup){
        if(scope.channels[channel]){

        }else{
          scope.channels.push(channel);
        }
        scope.period1ChannelsProduction.push(res.body.channelsGroup[channel].total);
      }
      //recupero il secondo periodo
      superagent('/api/hotels/1922/pace/bookingfrom/201401010000/bookingto/201505172359/arrivalfrom/20150701/arrivalto/20150731')
        .end(function(err, res){
          if(err || !res.ok){
            console.debug(err);
          }

          scope.period2 = res.body;
          //costruisco le serie per il garfico
          for(var channel in res.body.channelsGroup){
            if(scope.channels[channel]){

            }else{
              scope.channels.push(channel);
            }
            scope.period2ChannelsProduction.push(res.body.channelsGroup[channel].total);
          }

          buildChart('.period-chart', scope.channels, scope.period1ChannelsProduction, scope.period2ChannelsProduction);
        });

    });

  function buildChart(container, labels, data1, data2){
    $(container).highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: 'Canali'
            },
            xAxis: {
                categories: labels,
                crosshair: true
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Produzione (€)'
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"> <b>{point.y:.1f} €</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: [{
                name: 'Produzione periodo 1',
                data: data1
            },{
              name: 'Produzione periodo 2',
              data: data2
            }]
        });
  }

})
