var LocalStrategy = require('passport-local').Strategy;
var pools = require('./pools');
var User = require('../app/models/user')(pools.lyticsPool, pools.hermesPool);

module.exports = function(passport){
    
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });
    
    passport.deserializeUser(function(id, done){
       User.findById(id, function(err, user){
          done(err, user); 
       });
    });
    
    passport.use('local-signup', new LocalStrategy({
        
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
        
    }, function(req, email, password, done){
        process.nextTick(function(){
           
           
           User.findByEmail(email, function(err, user){
               if(err) return done(err);
               if(user){
                   return done(null, false);
               }else{
                   User.save({
                       email: email,
                       password: password
                   }, function(err, user){
                       if(err) throw err;
                       return done(null, user);
                   })
               }
           });
            
        });
    }));
    
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done){
        console.log(email);
        User.findByEmail(email, function(err, user){
           if(err) return done(err);
           if(!user){
               return done(null, false);
           }
           if(user){
               if(User.comparePassword(password, user.password)){
                   done(null, user);
               }else{
                   done(null, false);
               }
           }
        });
    }));
    
}
