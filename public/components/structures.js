jQuery(document).ready(function(){

  superagent.get('/api/users/2496194c-3741-4074-aee7-8afd2031555d/structures')
    .end(function(err, res){
      jQuery('#structures').DataTable( {
          data: res.body,
          info: false,
          paging: false,
          searching: false,
          columns: [
              { data: "id", visible: false },
              { data: "hotel_id", title:"Hotel ID" },
              { data: "validated", title: "Stato attivazione", createdCell: function(td, cellData, rowData, row, col){
                if(cellData){
                  jQuery(td).text('Attivo').addClass('success');
                }else{
                  jQuery(td).text('In revisione').addClass('warning');
                }

              }},
              { data: "note", title: "Note", defaultContent: 'Nessuna nota'}
          ]
      });
    });



});
