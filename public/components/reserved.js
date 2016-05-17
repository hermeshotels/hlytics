jQuery(document).ready(function () {

    var noHotelTl = new TimelineMax();
            noHotelTl.stop().to('.dashboard-wrapper', 0, {display: 'none'})
                .to('.no-hotels', 0 , {display: 'block'})
                .to('.no-hotels', 0.5, {opacity: 1});

    var loadingStatus = false;

    var loadingScreenTl = new TimelineMax();
    loadingScreenTl.stop().to('.reserved-loading', 0.5, {opacity: 1})
        .to('.reserved-loading', 0, {display: 'block'});

    document.addEventListener('loading', function(e){
        if(loadingStatus == false){
            loadingScreenTl.play();
            loadingStatus = !loadingStatus;
        }else{
            loadingScreenTl.reverse();
            loadingStatus = !loadingStatus;
        }
    }, false);

    //activate the tags input
    $('#tags').tagsInput({
        height: '45px',
        width: '300px',
        defaultText: 'ID Hotel'
    });

    //Set up the numeral library to format numbers
    numeral.language('it', {
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal : function (number) {
            return number === 1 ? 'er' : 'esimo';
        },
        currency: {
            symbol: '€'
        }
    });

    // switch between languages
    numeral.language('it');

    jQuery('.tooltipstered').tooltipster({
        theme: 'tooltipster-noir'
    });

    superagent.get('/api/hotels/list')
    .end(function(err, res){
        if(err || !res.ok){
            console.debug(err);
        }

        //Se l'utente ha hotel abbinati
        if(res.body.length > 0){
            //Carico la lista degli hotel nell'autocomplete
            var local = [];
            for(var i = 0; i < res.body.length; i++){
                local.push({value: res.body[i].HO_NOME, data: res.body[i].HO_ID})
            }


            jQuery('#hotelListBox').autocomplete({
                lookup: local,
                appendTo: '.pick-hotel',
                width: 250,
                transformResult: function(response) {
                    return {
                        suggestions: $.map(response.myData, function(dataItem) {
                            console.log(dataItem);
                            return { value: dataItem.HO_ID, data: dataItem.HO_NOME };
                        })
                    };
                },
                onSelect: function (suggestion) {
                    console.log(suggestion.data);
                    populateDashboard(suggestion.data);
                }
            });
        }else{
            //l'utente non ha ancora abbinato alcun hotel. richiedo l'inserimento di un codice struttura.
            noHotelTl.play();
        }

    });

    jQuery('#trace-hotels').on('click', function(e){
        e.preventDefault();
        var ids = jQuery('#tags').val();
        superagent.post('/api/users/add/hotel/').send({hotelid: ids}).end(function(err, res){
            if(err || !res.ok){
                console.debug(err);
            }
            //reload the page
            location.reload();
        });
    })
});
