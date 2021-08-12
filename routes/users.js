var express = require('express');
const bodyParser = require('body-parser');
var passport = require('passport');
const cors = require('./cors');

var User = require('../models/user');
var authenticate = require('../authenticate');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */

router.route('/')
.options(cors.corsWithOptions, (req, res) => {
	res.sendStatus(200);
})

router.get('/', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {authenticate.verifyAdmin(req, res, next)}, function(req, res, next) {
  User.find({})
  .then((users) => {
  	res.statusCode = 200;
  	res.setHeader('Content-Type', 'application/json');
  	res.json(users);
  }, (err) => next(err))
  .catch((err) => {
  	res.statusCode = 500;
  	res.setHeader('Content-Type', 'application/json');
  	res.json({err: err});
  });
});

router.post('/signup', cors.corsWithOptions, (req, res, next) => {
	User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
		if (err) {
			res.statusCode = 406;
			res.setHeader('Content-Type', 'application/json');
			return res.json({err: err});
		}
		else {
			if (req.body.firstname) {user.firstname = req.body.firstname}
			if (req.body.lastname) {user.lastname = req.body.lastname}
			user.save((err, user) => {
				if (err) {
					res.statusCode = 500;
					res.setHeader('Content-Type', 'application/json');
					res.json({err: err});
					return;
				}
				passport.authenticate('local')(req, res, () => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json({ success: true, status: 'Registration Successful!'});
				});
			});
		}
	});	
});

router.post('/login', cors.corsWithOptions, (req, res, next) => {

	passport.authenticate('local', (err, user, info) => {

		if(err)
			return next(err);

		if(!user){
			res.statusCode = 401;
			res.setHeader('Content-Type', 'application/json');
			res.json({ success: false, status: 'Login Unsuccessful ...', err: info });
		}

		req.logIn(user, (err) => {

			if(err){
				res.statusCode = 401;
				res.setHeader('Content-Type', 'application/json');
				res.json({ success: false, status: 'Login Unsuccessful...', err: "Could not Log in user ..." });
			}
		
			var token = authenticate.getToken({_id: req.user._id});
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json({ success: true, status: 'Login Successful...', token: token});

		});

	})(req, res, next); 

});

router.get('/logout', (req, res) => {

	if (req.session) {
		req.session.destroy();
		res.clearCookie('session-id');
		res.redirect('/'); //to Home page
	}
	else {
		var err = new Error('You are not logged in!');
		err.status = 403;
		next(err);
	}
});

router.get('/facebook/token', cors.corsWithOptions, passport.authenticate('facebook-token'), (req, res, next) => {
	if (req.user) {
		var token = authenticate.getToken({ _id: req.user._id });
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json({ success: true, token: token, status: 'Login Successful!'});
	}
});

router.get('/checkJWTToken', cors.corsWithOptions, (req, res) => {
	passport.authenticate('jwt', {session: false}, (err, user, info) => {
		if(err)
			return next(err);
		if(!user) {
			res.statusCode = 401;
			res.setHeader('Content-Type', 'application/json');
			return res.json({status: 'JWT invalid!', success: false, err: info});
		}
		else {
			res.statusCode = 200;
			return res.json({status: 'JWT Valid!', success: true, user: user});
		}
	}) (req, res);
})


module.exports = router;
