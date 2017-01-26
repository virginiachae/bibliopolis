// require express framework and additional modules
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    User = require('./models/user'),
    Book = require('./models/book'),
    Index = require('./models/index'),
    Children = require('./models/children'),
    session = require('express-session'),
    controllers = require('./controllers'),
    nodemailer = require('nodemailer'),
    CronJob = require('cron').CronJob;


// middleware
app.use(express.static('public'));
app.use(express.static('vendor'));
app.use(express.static('views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
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

//CRON
var overDue = new CronJob({
    cronTime: '00 00 00 * * 1-7',
    onTick: function() {
        var currentTime = new Date().getTime();
        Book.find({})
            .populate('child')
            .exec(function(err, foundBook) {
                foundBook.forEach(function(book) {
                    var transporter = nodemailer.createTransport({
                        service: 'Gmail', // loads nodemailer-ses-transport
                        auth: {
                            user: 'bibliopolis.2017@gmail.com',
                            pass: 'confirm:password'
                        }
                    });
                    if (book.rentalDue != null && book.rentalDue.getTime() < currentTime) {
                        var mailOptions = {
                            from: 'bibliopolis.2017@gmail.com',
                            to: book.child.parentContact,
                            subject: "Your Child's Book is Overdue",
                            html: "Your child, " + book.child.fullName + "'s book " + book.title + " is overdue. Please return to Bibliopolis as soon as possible. Thank you."
                        }

                        transporter.sendMail(mailOptions, function(err, email) {
                            if (err) {
                                console.log(err);
                            } else {

                            }
                        })
                    } else if (book.rentalDue != null && (book.rentalDue.getTime() - currentTime < (1000 * 3600 * 24))) {
                        var mailOptions = {
                            from: 'bibliopolis.2017@gmail.com',
                            to: book.child.parentContact,
                            subject: "Your Child's Book is Due Today",
                            html: "Your child, " + book.child.fullName + "'s book " + book.title + " is due today. Please return to Bibliopolis as soon as possible. Thank you."
                        }

                        transporter.sendMail(mailOptions, function(err, email) {
                            if (err) {
                                console.log(err);
                            } else {

                            }
                        })
                    } else if (book.rentalDue != null && (book.rentalDue.getTime() - currentTime > (1000 * 3600 * 24)) && (book.rentalDue.getTime() - currentTime < (1000 * 3600 * 24 * 2))) {
                        var mailOptions = {
                            from: 'bibliopolis.2017@gmail.com',
                            to: book.child.parentContact,
                            subject: "Your Child's Book is Due Tomorrow",
                            html: "This is a friendly reminder that your child, " + book.child.fullName + "'s book " + book.title + " is due tomorrow. Please return to Bibliopolis as soon as possible. Thank you."
                        }

                        transporter.sendMail(mailOptions, function(err, email) {
                            if (err) {
                                console.log(err);
                            } else {

                            }
                        })
                    }
                })
            })
    },
    start: true,
    timeZone: "America/Los_Angeles"
});

overDue.start();




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
// app.get('/children/destroy', function (req,res){
//   Children.remove({})
//   .exec(function(err, success) {
//         res.send(success);
//     });
// });

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
        newBook.child = null;
        bookUser.books.push(newBook);
        bookUser.save(function(err, succ) {
            if (err) {
                console.log(err);
            }
            newBook.save(function(err, succ) {
                if (err) {
                    console.log(err);
                }

                res.redirect('../profile');
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
        res.redirect('../profile');
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


app.patch('/api/books', function(req, res) {
    console.log('updating rental with data', req.body);
    Book.findById(req.body._id, function(err, foundBook) {
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
                foundBook.rentalDate = new Date();
                foundBook.rentalDue = new Date(foundBook.rentalDate.getTime() + 1000 * 3600 * 24 *2);
                bookChild.books.push(foundBook);
                bookChild.save(function(err, succ) {
                    if (err) {
                        console.log(err);
                    }
                    foundBook.save(function(err, savedBook) {
                        if (err) {
                            console.log('saving altered user failed in last server thing');
                        }
                        var transporter = nodemailer.createTransport({
                            service: 'Gmail', // loads nodemailer-ses-transport
                            auth: {
                                user: 'bibliopolis.2017@gmail.com',
                                pass: 'confirm:password'
                            }
                        });

                        var mailOptions = {
                            from: 'bibliopolis.2017@gmail.com',
                            to: bookChild.parentContact,
                            subject: "Your Child Has Checked Out a Book from Bibliopolis",
                            html: "This is to inform you that " + bookChild.fullName + " has checked out " + foundBook.title + ". Please make sure that the book is returned to Bibliopolis by " + foundBook.rentalDue + "."
                        }
                        transporter.sendMail(mailOptions, function(err, email) {
                            if (err) {
                                console.log(err);
                            } else {
                                res.json({
                                    savedBook
                                })
                            };
                        })
                    });
                });
            })
        }
    })
})

app.put('/api/children', function(req, res) {
    console.log('returning rental with data', req.body);
    Children.findOne({
        fullName: req.body.child.fullName
    }, function(err, foundChild) {
        if (err) {
            console.log('error in server.js', err);
        } else {
            Book.findById(req.body._id, function(err, childBook) {
                if (err) {
                    console.log(err);
                }
                var index = foundChild.books.indexOf(childBook);
                foundChild.books.splice(index, 1);
                childBook.child = null;
                childBook.rentalDate = null;
                childBook.rentalDue = null;
                childBook.save(function(err, succ) {
                    if (err) {
                        console.log(err);
                    }
                    foundChild.save(function(err, savedChild) {
                        if (err) {
                            console.log('saving altered user failed in last server thing');
                        }
                        res.json({
                            savedChild
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
        res.redirect('profile')
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
        res.redirect('../profile')
    });
});

// login route with placeholder response AJS DONE
app.get('/login', function(req, res) {
    if (req.session.userId != null || undefined) {
        res.redirect('profile')
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
            res.redirect('/profile')
        }
    });
});

// show user profile page
app.get('/profile', function(req, res) {
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
app.listen(process.env.PORT || 3000);
