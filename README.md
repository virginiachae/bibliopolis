# bibliopolis
a book checkout app for librarians! 

https://intense-scrubland-74617.herokuapp.com/https://intense-scrubland-74617.herokuapp.com/

# Why bibliopolis? 
bibliopolis came about because I saw a need in my church's children's library. 
![alt text](http://i.imgur.com/YRsSIAg.jpg "The REAL Bibliopolis")

The REAL Bibliopolis! 
Currently the librarian has been "checking out" books to the kids by sticking a post-it on the book and taking a picture of the child with the book and then texting the picture to the parent. For example: 

![alt text](http://i.imgur.com/o7czkDZ.jpg "Girl")
![alt text](http://i.imgur.com/15f3IyX.jpg "Boy")

bibliopolis is a  way to checkout book to kids and autmotically notifying the parents of the due date of the book. bibliopolis also sends a reminder email the day before the book is due until the book is returned. 

#Technologies Used
* MongoDB
* Express.js
* AngularJS
* Node.js
 * bcrypt
 * body-parser
 * cron
 * ejs
 * express-session
 * node-cron
 * nodemailer
 
# Original User Story, Wireframes and ERD
![alt text](http://i.imgur.com/hWVZsF8.png "User Story")
![alt text](http://i.imgur.com/JzYTA4W.png "ERD")
![alt text](http://i.imgur.com/8hKMYqP.png "Wireframes")

The idea was for the librarian AND the parent to be able to track which child had which book and when each were due and possibly even allow the parent to pay the fee with PayPal. However, what ended up coming out looks much different. Mostly because I did it in the MEAN stack and not with Ruby on Rails. 

# Most Difficult Problem
Working with bcyrpt and getting the current user. (Thanks Vlad)
```javascript
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

```
```javascript
	$http({
        method: 'GET',
        url: '/api/current-user'
    }).then(function successCb(res) {
				$scope.user = res.data;
    }, function errorCb(res) {
        console.log('there was an error getting book data', res);
    });

```

# Steph Curry Code
Working with node-cron and scheduling emails!
```javascript
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
```

# Unsolved Problems and Future Features
* MVC!!
* Error handling (the one person I know who is going to use this is smart, she'll figure it out)
* An interface for parents, currently this is a librarian interface
* Associate "members" to each librarian









