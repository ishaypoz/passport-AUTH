const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const localStartegy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const mongoose = require('mongoose');
const User = require('./models/user');

app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
//This is passport configuration
app.use(
	require('express-session')({
		secret: 'Secret Words',
		resave: false, //option you have to use
		saveUnitialized: false
	})
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStartegy(User.authenticate())); //authenticate came with passportLocalMongoose
passport.serializeUser(User.serializeUser()); //use passportLocalMongoose
passport.deserializeUser(User.deserializeUser()); //use passportLocalMongoose

//get user in every page
app.use(function(req, res, next){
	res.locals.user = req.user;
	next();
});

/*=========== 
    Routes 
============*/

app.get('/', function (req, res) {
	res.render('home');
});

app.get('/secret', isLoggedIn, function (req, res) {
	// console.log(req.user); get the user id and username
	res.render('secret', { user: req.user });
});

//register routes
app.get('/register', function (req, res) {
	res.render('register');
});
app.post('/register', function (req, res) {
	//.register provided by passportLocaclMongoose get(user object, password, callback)
	User.register(new User({ username: req.body.username }), req.body.password, function (err, user) {
		if (err) {
			console.log(err);
			return res.render('register');
		} else {
			//authenticad with the local startegy
			passport.authenticate('local')(req, res, function () {
				res.redirect('/secret');
			});
		}
	});
});

//login routes
app.get('/login', function (req, res) {
	res.render('login');
});
//login logic
//middleware "authenticate" run before callback function
//this authenticate function from passportLocalMongoose take username from db and match the password with it
app.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/secret',
		failureRedirect: '/register'
	}), //tells the authenticate where to redirect
	function (req, res) {
		User;
	}
);

app.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/');
});

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.redirect('/login');
	}
}

app.listen(3000, function () {
	console.log('Connected to Server!');
});
