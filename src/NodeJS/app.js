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
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('views'));

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
	},
    firstname : {
        type        : String,
        required    : false
    },
    name : {
        type        : String,
        required    : false
    },
    age : {
        type        : Number,
        required    : false
    },
    gender : {
        type        : String,
        required    : false
    },
    orientation : {
        type        : String,
        required    : false
    },
    location : {
        type        : String,
        required    : false
    },
    description : {
        type        : String,
        required    : false
    },
    hobbies : {
        type        : String,
        required    : false
    }

});	

// When form is complete, put cb argument at the end of the list of all arguments
UserSchema.statics.add = function(arg_username, arg_password, arg_firstname, arg_name, arg_age, arg_gender, arg_orientation, arg_location, arg_description, arg_hobbies, cb) {
    var User = this || mongoose.model('User');
    var newUser = new User({username: arg_username, password: arg_password, firstname : arg_firstname, name: arg_name, age: arg_age, gender: arg_gender, 
        orientation: arg_orientation, location: arg_location, description: arg_description, hobbies: arg_hobbies});
    newUser.save(cb);
}
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
app.get('/welcome', function(req, res, next) {
    res.sendfile('views/welcome.html');
    User.findOne(req.query,
        function(err, user) {
            if (err || !user) { 
                return false; 
            }
            console.log(user)
            return true;
        });
});
app.get('/loginSuccess' , function(req, res, next){
    res.send('Successfully authenticated');
});
app.get('/loginFailure' , function(req, res, next){
    res.send('Failure to authenticate');
});

app.post('/login', passport.authenticate('local', 
{
    failureRedirect: '/loginFailure'
}), 
function(req, res) {
    // If this function gets called, authentication was successful.
    res.redirect('/welcome?_id=' + req.user._id );
  }
);
app.post('/register', function(req, res) 
{
  User.add(req.body.usermail, req.body.password, req.body.first_name, req.body.last_name, req.body.age, req.body.gender, req.body.looking_for, 
    req.body.location, req.body.description, req.body.hobbies, function(err, data) {
    if(!err)
      res.end('Successfully registered');
    else
      res.end('Failure to register');
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
