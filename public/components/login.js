jQuery(document).ready(function(){
    
    jQuery('#login-form').parsley();
    
    var loadingTl = new TimelineLite();
    loadingTl.stop().to('.loading', 0.5, {display: 'block'});
    
    var errorboxTl = new TimelineLite();
    errorboxTl.stop().to('.login-error', 0.1, {display: 'block'})
        .to('.login-error', 0.2, {opacity: 1, 'margin-top': 30, width: '100%'})
        .to('.login-error > span', 0.1, {opacity: 1});
    
    jQuery('#login-form').submit(function(event){
        event.preventDefault();
        errorboxTl.reverse();
        loadingTl.play();
        
        //Ajax request
        //Recupero i dati della richiesta
        var creds = {
            email: jQuery('#email').val(),
            password: jQuery('#password').val()
        }
    
       superagent.post('/login')
        .send(creds)
        .end(function(err, res){
            if(err || !res.ok){
                console.debug(err);
                loadingTl.reverse();
                errorboxTl.play();
                return;
            }
            window.location.href = '/reserved/dashboard';
        });
        return false;
    });
    
    
})