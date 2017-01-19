// require express framework and additional modules
var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
	User = require('./models/user');

var session = require('express-session');

// middleware
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect('mongodb://localhost/bibliopolis');
app.use(session({
  saveUninitialized: true,
  resave: true,
  secret: 'SuperSecretCookie',
  cookie: { maxAge: 30 * 60 * 1000 } // 30 minute cookie lifespan (in milliseconds)
}));
app.use('/', function (req, res, next) {
  req.currentUser = function (callback) {
    User.findOne({_id: req.session.userId}, function (err, user) {
      if (!user) {
        callback("No User Found", null)
      } else {
        req.user = user;
        callback(null, user);
      }
    });
  };

  next();
});

////LOGIN AND SIGNUP for USERS!!
// signup route (renders signup view)
app.get('/signup', function (req, res) {
  if (req.session.userId != null || undefined) {
    res.redirect('user-show')
  }
		res.render('signup');
});

// Sign up route - creates a new user with a secure password
app.post('/users', function (req, res) {
  // use the email and password to authenticate here
  User.createSecure(req.body.email, req.body.password, req.body.fName, req.body.lName, req.body.img, function (err, user) {
		req.session.userId = user._id;
    res.redirect('user-show')
  });
});

// login route with placeholder response
app.get('/login', function (req, res) {
  if (req.session.userId != null || undefined) {
    res.redirect('user-show')
  }
  res.render('login');
});

// authenticate the user
app.post('/sessions', function (req, res) {
  // call authenticate function to check if password user entered is correct
  User.authenticate(req.body.email, req.body.password, function (err, currentUser) {
		if (err) {
      //bad username/password/some other error
      console.log(err);
      req.session.userId = null;
      //can redirect to static "uh oh " page or use alert
			res.redirect('login')
		}
		else {
      //User successfully logged in
    req.session.userId = currentUser._id;
		res.redirect('user-show')
	}
  });
});

// show user profile page
app.get('/user-show', function (req, res) {
  // find the user currently logged in
  if (req.session.userId === null || undefined) {
    res.redirect('login')
  }
  User.findOne({_id: req.session.userId}, function (err, currentUser) {
    res.render('user-show.ejs', {user: currentUser})
	});
});

app.get('/logout', function (req, res) {
  // remove the session user id
  req.session.userId = null;
  req.user = null;
  // redirect to login (for now)
  res.redirect('/login');
});

// listen on port 3000
app.listen(3000, function () {
  console.log('server started on locahost:3000');
});
