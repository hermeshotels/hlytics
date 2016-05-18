var dashboardTl = new TimelineMax();
dashboardTl.stop().to('.dashboard-wrapper', 0, {opacity: 1});

var startCurrent = moment().startOf('year').format('YYYYMMDD0000');
var endCurrent = moment().endOf('year').format('YYYYMMDD0000');

var startPrevious = moment().startOf('year').subtract(1, 'years').format('YYYYMMDD0000');
var endPrevious = moment().endOf('year').subtract(1, 'years').format('YYYYMMDD2359');

var scope = {
    currentHotel: 0,
    currentData: null,
    previousData: null,
    currentProductionTotal: 0,
    previousProductionTotal: 0,
    currentAdrTotal: 0,
    previousAdrTotal: 0,
    currentTotalDifference: 0,
    currentAdrDifference: 0,
    currentMonth: moment().format('M'),
    view: 'year',
    productionView: 'year',
    adrView: 'year'
};

rivets.formatters.currency = function(value){
  return numeral(value).format('$0,0.00');
}
rivets.formatters.percent = function(value){
  return numeral(value / 100).format('00.00%');
}
rivets.binders.posneg = function(el, value) {
  console.log(value);
  if(value > 0){
    jQuery(el).removeClass('t-warning');
    jQuery(el).addClass('t-success');
  }else{
    jQuery(el).removeClass('t-success');
    jQuery(el).addClass('t-warning');
  }
}

rivets.bind(jQuery('#dashboard'), {scope: scope});

function populateDashboard(hotelId){
    var loading = new Event('loading');
    document.dispatchEvent(loading);
    scope.currentHotel = hotelId;
    //Recupero i dati necessari alla popolazione della dashboard
    superagent.get('/api/hotels/' + scope.currentHotel + '/production/channel/from/' + startCurrent + '/to/' + endCurrent)
    .end(function(err, res){
        if(err) console.debug(err);

        scope.currentData = res.body;
        //setup the graph
        channelAdrGraph();

        superagent.get('/api/hotels/' + scope.currentHotel + '/production/channel/from/' + startPrevious + '/to/' + endPrevious)
            .end(function(err, res){
                if(err) console.debug(err);
                scope.previousData = res.body;
                percentualDifference();
                setStatisticsData();
                dashboardTl.play();
                document.dispatchEvent(loading);
            });

    });
}

function channelAdrGraph(){
    //La funzione è necessaria per formattare il valore degli ADR nel dato necessario
    //ad Hightcarts per la crezione del grafico
    var channels = [];
    var channelsTotal = [];
    var channelsAdr = [];

    var channelLabels = $.map(scope.currentData.details.channelsGroup, function(v, i){
        channels.push(i);
        channelsTotal.push(v.total);
        channelsAdr.push(v.adr);
    });

    jQuery('#channel-adr-chart').highcharts({
        chart: {
            zoomType: 'xy'
        },
        title: {
            text: 'Produzione Canali con ADR'
        },
        xAxis: [{
            categories: channels,
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
            data: channelsTotal,
            tooltip: {
                valueSuffix: ''
            }

        }, {
            name: 'ADR',
            type: 'spline',
            data: channelsAdr,
            tooltip: {
                valueSuffix: '€'
            }
        }]
    });
}

function percentualDifference(){

    scope.yearlyProductionDifference = ((scope.currentData.details.productionTotal - scope.previousData.details.productionTotal) / scope.previousData.details.productionTotal * 100);
    scope.yearlyAdrDifference = ((scope.currentData.details.totalAdr - scope.previousData.details.totalAdr) / scope.previousData.details.totalAdr ) * 100
    scope.monthlyProductionDifference = ((scope.currentData.details.monthsProduction[scope.currentMonth].total - scope.previousData.details.monthsProduction[scope.currentMonth].total) / scope.previousData.details.monthsProduction[scope.currentMonth].total) * 100;
    scope.monthlyAdrDifference = ((scope.currentData.details.monthsProduction[scope.currentMonth].adr - scope.previousData.details.monthsProduction[scope.currentMonth].adr) / scope.previousData.details.monthsProduction[scope.currentMonth].adr ) * 100;

}

function setStatisticsData(){
  if(scope.view == 'month'){
    //totale della produzione
    scope.currentProductionTotal = scope.currentData.details.monthsProduction[scope.currentMonth].total;
    scope.previousProductionTotal = scope.previousData.details.monthsProduction[scope.currentMonth].total;
    //totale adr
    scope.currentAdrTotal = scope.currentData.details.monthsProduction[scope.currentMonth].adr;
    scope.previousAdrTotal = scope.previousData.details.monthsProduction[scope.currentMonth].adr;
    //differenza di produzione
    scope.currentTotalDifference = scope.monthlyProductionDifference;
    //differenza di adr
    scope.currentAdrDifference = scope.monthlyAdrDifference;
    scope.differenceMessage = moment().format('MMMM') + ' del ' + moment().subtract(1, 'years').format('YYYY');
  }else if(scope.view == 'year'){
    //totale della produzione
    scope.currentProductionTotal = scope.currentData.details.productionTotal;
    scope.previousProductionTotal = scope.previousData.details.productionTotal;
    //totale adr
    scope.currentAdrTotal = scope.currentData.details.totalAdr;
    scope.previousAdrTotal = scope.previousData.details.totalAdr;
    //differenza di produzione
    scope.currentTotalDifference = scope.yearlyProductionDifference;
    //differenza di adr
    scope.currentAdrDifference = scope.yearlyAdrDifference;
    scope.differenceMessage = ' su anno ' + moment().subtract(1, 'years').format('YYYY');
  }
}


jQuery(document).ready(function(){


    alertify.log("Bentornato.");
    jQuery('.change-view').on('click', function(event){
        event.preventDefault();
        scope.view = jQuery(this).data('type');
        setStatisticsData();
    });

});
