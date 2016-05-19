jQuery(document).ready(function(){

  superagent.get('/api/hotels/list/active')
    .end(function(err, res){
      if(err || !res.ok){
        console.debug(err);
      }

      jQuery('#structures').DataTable( {
          data: res.body,
          dom: 'Bfrtip',
          colReorder: true,
          buttons: ['copy', 'csv', 'pdf', 'print', 'colvis'],
          columns: [
              { data: "name", title: "Nome" },
              { data: "starts", title:"Stelle" },
              { data: "star_desc", title: "Stelle esteso"},
              { data: "city", title: "Città"}
          ]
      });
    })

});
