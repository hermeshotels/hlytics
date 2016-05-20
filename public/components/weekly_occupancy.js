jQuery(document).ready(function(){

    var scope = {};

    rivets.formatters.currency = function(value){
      return numeral(value).format('$ 0,0.00');
    }
    rivets.formatters.percent = function(value){
      return numeral(value / 100).format('00.00%');
    }
    rivets.binders.posneg = function(el, value) {
      if(value > 0){
        jQuery(el).removeClass('t-warning');
        jQuery(el).addClass('t-success');
      }else{
        jQuery(el).removeClass('t-success');
        jQuery(el).addClass('t-warning');
      }
    }
    rivets.formatters.numround = function(value){
      return parseFloat(value).toFixed(2);
    }

    rivets.bind(jQuery('#report'), {scope: scope});

    superagent.get('/api/hotels/1684/reservations/list/from/20160501/to/20160515/date/arrival')
      .end(function(err, res){
        if(err || !res.ok){
          return console.debug(err);
        }

        scope.data = res.body;

        var weekoccupancyData = [];
        var weekRevenueData = [];
        var averageAdr = 0;
        var weekdayCount = 0;

        var days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
        for(var weekday in res.body.occupancy[5]){

          averageAdr += res.body.occupancy[5][weekday].adr;

          weekoccupancyData.push({
            name: days[weekday],
            y: res.body.occupancy[5][weekday].occupancy
          });
          weekRevenueData.push({
            name: days[weekday],
            y: res.body.occupancy[5][weekday].billed
          });

          weekdayCount++;
        }

        scope.averageAdr = averageAdr / weekdayCount;
        scope.averageWindow = scope.data.totals.totalWindow / scope.data.reservations.length;
        scope.averageNights = scope.data.totals.totalNights / scope.data.reservations.length;
        setUpWeeklyOccupancyChart(weekoccupancyData);
        setUpWeeklyRevenueChart(weekRevenueData);


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

function setUpWeeklyRevenueChart(data){
  $('#weekly-revenue').highcharts({
      chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie'
      },
      title: {
          text: 'Revenue settimanale'
      },
      tooltip: {
          pointFormat: 'Revenue <b>{point.percentage:.1f}%</b>'
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
          name: 'Revenue',
          colorByPoint: true,
          data: data
      }]
  });
}
