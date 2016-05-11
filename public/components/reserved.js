jQuery(document).ready(function () {

    jQuery('.tooltipstered').tooltipster({
        theme: 'tooltipster-noir'
    });
   
    superagent.get('/api/hotels/list')
    .end(function(err, res){
        if(err || !res.ok){
            console.debug(err);
        }
        
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
                alert('You selected: ' + suggestion.value + ', ' + suggestion.data);
            }
        });
        
    });
});