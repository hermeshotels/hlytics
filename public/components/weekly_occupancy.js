jQuery(document).ready(function(){

    superagent.get('/api/hotels/1684/reservations/list/from/20160501/to/20160515/date/arrival')
      .end(function(err, res){
        if(err || !res.ok){
          return console.debug(err);
        }

        var weekoccupancyData = [];
        var weekRevenueData = [];
        var days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
        for(var weekday in res.body.occupancy[5]){
          weekoccupancyData.push({
            name: days[weekday],
            y: res.body.occupancy[5][weekday].occupancy
          });
          weekRevenueData.push({
            name: days[weekday],
            y: res.body.occupancy[5][weekday].billed;
          })
        }
        setUpWeeklyOccupancyChart(weekoccupancyData);


      });

});

function setUpWeeklyOccupancyChart(data){

  $('#weekly-occupancy').highcharts({
      chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie'
      },
      title: {
          text: 'Occupazione settimanale'
      },
      tooltip: {
          pointFormat: 'Occupazione <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
          pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                  enabled: true,
                  format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                  style: {
                      color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                  }
              }
          }
      },
      series: [{
          name: 'Giorni',
          colorByPoint: true,
          data: data
      }]
  });
}
