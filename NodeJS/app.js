var http        = require('http');
var url         = require('url');
var mongoose    = require('mongoose');
var crypto      = require('crypto');

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
UserSchema.statics.findByCredentials = function(arg_username,arg_password,cb) {
	var User = this || mongoose.model('User');
	User.findOne({username: arg_username, password: arg_password}, cb);
};
UserSchema.statics.add = function(arg_username,arg_password,cb) {
	var User = this || mongoose.model('User');
	var newUser = new User({username : arg_username, password: arg_password});
	newUser.save(cb);
};
UserSchema.statics.remove = function(arg_username,arg_password,cb) {
	var User = this || mongoose.model('User');
	User.findOne({username: arg_username, password: arg_password}).remove(cb);
};
var User = mongoose.model('User',UserSchema);

// Query as: http://ip:port/?type=login&username=test_user&password=test_password
function request_func(req,res)
{
    try
    {
        if (req.url == '/favicon.ico')
        {
            res.end();
            return;
        }

        res.writeHead(200);        
        
        var parsedUrl      	= url.parse(req.url, true);
        var queryAsObject  	= parsedUrl.query;

        var arg_type      	= String(queryAsObject['type']);
        var arg_username 	= String(queryAsObject['username']);
        var arg_password  	= String(queryAsObject['password']);
    	
        if(arg_type == 'login')
        {      
			User.findByCredentials(arg_username, arg_password, function(err, data) {
				if(!err && data != null)
					res.end('true');
				else
					res.end('false');
			});
        }
        if(arg_type == 'register')
        {
        	User.add(arg_username, arg_password, function(err, data) {
        		if(!err)
        			res.end('true');
        		else
        			res.end('false');
        	});
        }
        if(arg_type == 'deregister')
        {
        	User.remove(arg_username, arg_password, function(err, data) {
				if(!err && data == 1)
					res.end('true');
				else
        			res.end('false');
			});
        }
    }
    catch(e)
    {
    	console.log("Exception caught: " + e);
    	res.end('false');
    }
}

// mongoose.disconnect();

var server = http.createServer(request_func);
server.listen(1337,"127.0.0.1");
console.log('Server running at http://127.0.0.1:1337');
