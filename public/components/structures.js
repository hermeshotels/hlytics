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
                  jQuery(td).text('Attivo').addClass('t-success');
                }else{
                  jQuery(td).text('In revisione').addClass('t-warning');
                }

              }},
              { data: "note", title: "Note", defaultContent: 'Nessuna nota'}
          ]
      });
    });

    jQuery('.add-structure').on('click', function(e){
      e.preventDefault();
      alertify.defaultValue("0").prompt("Digita l'ID della struttura che vuoi aggiungere",
          function (val, ev) {
            // The click event is in the event variable, so you can use it here.
            ev.preventDefault();
            //provo ad aggiungere l'hotel
            superagent.post('/api/users/add/hotel').send({hotelid: val}).end(function(err, res){
              if(err || !res.ok){
                alertify.error("Aggiunta struttura annullata.");
              }else{
                alertify.success("Richiesto di collegamento per l'id: " + val);
              }
            });
          }, function(ev) {
            // The click event is in the event variable, so you can use it here.
            ev.preventDefault();
            alertify.error("Aggiunta struttura annullata.");
          });
    });

});
