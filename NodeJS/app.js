var express         = require('express');

var http            = require('http');
var path            = require('path');

var mongoose        = require('mongoose');
var passport        = require('passport');
var LocalStrategy   = require('passport-local').Strategy;
var bodyParser      = require('body-parser');

// Setup express.

var app = express();
app.set('port', process.env.PORT || 1337);
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded() );
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// Setup mongo.

mongoose.connect('mongodb://127.0.0.1/dating_site_db');

var UserSchema 	= new mongoose.Schema(
{
	username : {
		type 		: String,
		unique 		: true,
		required 	: true
	}, 
	password : {
		type 		: String,
		required 	: true
	}
});	
UserSchema.statics.add = function(arg_username,arg_password,cb) {
  var User = this || mongoose.model('User');
  var newUser = new User({username : arg_username, password: arg_password});
  newUser.save(cb);
};
var User = mongoose.model('User',UserSchema);

// Passport section.

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
passport.use(new LocalStrategy(function(username, password, done) {
    process.nextTick(function () {
      User.findOne({'username':username},
        function(err, user) {
            if (err) { 
                return done(err); 
            }
            if (!user) { 
                return done(null, false); 
            }
            if (user.password != password) { 
                return done(null, false); 
            }
            return done(null, user);
        });
    });
  }
));

app.get('/login', function(req, res, next) {
  res.sendfile('views/login.html');
});
app.get('/register', function(req, res, next) {
  res.sendfile('views/register.html');
});

app.get('/loginSuccess' , function(req, res, next){
    res.send('Successfully authenticated');
});
app.get('/loginFailure' , function(req, res, next){
    res.send('Failure to authenticate');
});

app.post('/login', passport.authenticate('local', 
{
    successRedirect: '/loginSuccess',
    failureRedirect: '/loginFailure'
}));
app.post('/register', function(req, res) 
{
  User.add(req.body.username, req.body.password, function(err, data) {
    if(!err)
      res.end('Successfully registered');
    else
      res.end('Failure to register');
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
