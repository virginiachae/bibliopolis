// require express framework and additional modules
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    User = require('./models/user'),
    Book = require('./models/book');
Children = require('./models/children');

var session = require('express-session');
var controllers = require('./controllers');

// middleware
app.use(express.static('public'));
app.use(express.static('views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
mongoose.connect('mongodb://localhost/bibliopolis');
app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: 'SuperSecretCookie',
    cookie: {
        maxAge: 30 * 60 * 1000
    } // 30 minute cookie lifespan (in milliseconds)
}));
app.use('/', function(req, res, next) {
    req.currentUser = function(callback) {
        User.findOne({
            _id: req.session.userId
        }, function(err, user) {
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

/////////////////
//controllers///
///////////////
// app.get('/books/destroy', function (req,res){
//   Book.remove({})
//   .exec(function(err, success) {
//         res.send(success);
//     });
// });
//
// app.get('/users/destroy', function (req,res){
//   User.remove({})
//   .exec(function(err, success) {
//         res.send(success);
//     });
// });
var currentUserId;
app.get('/', function(req, res) {
    res.render('index.html.ejs');
});

app.get('/books/new', function(req, res) {
    res.render('index.html.ejs');
});

app.get('/books', function(req, res) {
    res.render('index.html.ejs');
});

app.get('/api/books', function(req, res) {
    Book.find({})
        .populate('user')
        .populate('child')
        .exec(function(err, success) {
            res.json(success);
        });
});

app.post('/api/books', function(req, res) {
    var newBook = new Book(req.body);
    User.findOne({
        email: req.body.user,
    }, function(err, bookUser) {
        if (err) {
            console.log(err);
            return
        }
        newBook.user = bookUser;
        bookUser.books.push(newBook);
        bookUser.save(function(err, succ) {
            if (err) {
                console.log(err);
            }
            newBook.save(function(err, succ) {
                if (err) {
                    console.log(err);
                }

                res.redirect('../books');
            })
        });
    });
});

app.get('/api/children', function(req, res) {
    Children.find({})
        .populate('books')
        .exec(function(err, success) {
            res.json(success);
        });
})


app.post('/api/children', function(req, res) {
    Children.create(req.body, function(err, child) {
        if (err) {
            console.log('error', err);
        }
        console.log(child);
        res.json(child);
    });
})

app.get('/children/new', function(req, res) {
    res.render('index.html.ejs');
});


app.get('/users', function(req, res) {
    res.render('index.html.ejs');
});

app.put('/api/books', function(req, res) {
    console.log('updating with data', req.body);
    Book.findById(req.body._id, function(err, foundBook) {
        console.log(req.body);
        if (err) {
            console.log('error in server.js', err);
        } else {
            foundBook.title = req.body.title;
            foundBook.author = req.body.author;
            foundBook.ageRange = req.body.ageRange;
            foundBook.img = req.body.img;
            foundBook.save(function(err, savedBook) {
                if (err) {
                    console.log('saving altered user failed in last server thing');
                }
                res.json({
                    savedBook
                });
            });
        }
    })
});

app.put('/api/books', function(req, res) {
    console.log('updating with data', req.body);
    Book.findById(req.body._id, function(err, foundBook) {
        console.log(req.body);
        if (err) {
            console.log('error in server.js', err);
        } else {
            foundBook.title = req.body.title;
            foundBook.author = req.body.author;
            foundBook.ageRange = req.body.ageRange;
            foundBook.img = req.body.img;
            foundBook.save(function(err, savedBook) {
                if (err) {
                    console.log('saving altered user failed in last server thing');
                }
                res.json({
                    savedBook
                });
            });
        }
    })
});
app.patch('/api/books', function(req, res) {
    console.log('updating rental with data', req.body);
    Book.findById(req.body._id, function(err, foundBook) {
        console.log(req.body);
        if (err) {
            console.log('error in server.js', err);
        } else {
            Children.findOne({
                fullName: req.body.child,
            }, function(err, bookChild) {
                if (err) {
                    console.log(err);
                }
                foundBook.child = bookChild;
                bookChild.books.push(foundBook);
                bookChild.save(function(err, succ) {
                    if (err) {
                        console.log(err);
                    }
                    foundBook.save(function(err, savedBook) {
                        if (err) {
                            console.log('saving altered user failed in last server thing');
                        }
                        res.json({
                            savedBook
                        });
                    });
                })

            })
        }
    })
})



app.delete('/api/books/:id', function destroy(req, res) {
    console.log(req);
    Book.findOneAndRemove({
        _id: req.params.id
    }, function(err, foundBook) {
        // note you could send just send 204, but we're sending 200 and the deleted entity
        res.json(foundBook);
    });
});



////LOGIN AND SIGNUP for USERS!!
// signup route (renders signup view)
app.get('/signup', function(req, res) {
    if (req.session.userId != null || undefined) {
        res.redirect('user-show')
    }
    res.render('index.html.ejs');
});

app.get('/api/users', function(req, res) {
    User.find({})
        .populate('books')
        .exec(function(err, success) {
            res.json(success);
        });
});

// Sign up route - creates a new user with a secure password
app.post('/api/users', function(req, res) {
    // use the email and password to authenticate here
    User.createSecure(req.body.email, req.body.password, req.body.fName, req.body.lName, req.body.img, function(err, user) {
        req.session.userId = user._id;
        res.redirect('../user-show')
    });
});

// login route with placeholder response AJS DONE
app.get('/login', function(req, res) {
    if (req.session.userId != null || undefined) {
        res.redirect('user-show')
    }
    res.render('index.html.ejs');
});

// authenticate the user AJS DONE
app.post('/sessions', function(req, res) {
    // call authenticate function to check if password user entered is correct
    User.authenticate(req.body.email, req.body.password, function(err, currentUser) {
        if (err) {
            //bad username/password/some other error
            console.log(err);
            req.session.userId = null;
            //can redirect to static "uh oh " page or use alert
            res.redirect('/login')
        } else {
            //User successfully logged in
            req.session.userId = currentUser._id;
            currentUserId = currentUser._id
            res.redirect('/user-show')
        }
    });
});

// show user profile page
app.get('/user-show', function(req, res) {
    // find the user currently logged in
    if (req.session.userId === undefined) {
        res.redirect('login')
    }
    User.findOne({
        _id: req.session.userId
    }, function(err, currentUser) {
        res.render('index.html.ejs')
    });
});

app.get('/logout', function(req, res) {
    // remove the session user id
    req.session.userId = undefined;
    // redirect to login (for now)
    res.render('index.html.ejs');
});

app.get('/api/current-user', function(req, res) {
    User.findOne({
            _id: req.session.userId
        })
        .populate({
            path: 'books',
            populate: {
                path: 'child',
                model: 'Children'
            }
        })
        .exec(function(err, user) {
            if (!user) {
                console.log("No User Found", null);
            } else {
                res.json(user);
            }
        });
})

app.put('/api/users', function(req, res) {
    console.log('updating with data', req.body);
    User.findById(req.body._id, function(err, foundUser) {
        console.log(req.body);
        if (err) {
            console.log('error in server.js', err);
        } else {
            foundUser.fName = req.body.fName;
            foundUser.lName = req.body.lName;
            foundUser.email = req.body.email;
            foundUser.save(function(err, savedUser) {
                if (err) {
                    console.log('saving altered user failed in last server thing');
                }
                res.json({
                    savedUser
                });
            });
        };
    })
})

app.get('/api/books', function(req, res) {
    Book.find({})
        .populate('user')
        .exec(function(err, success) {
            res.json(success);
        });
});

// listen on port 3000
app.listen(3000, function() {
    console.log('server started on locahost:3000');
});
