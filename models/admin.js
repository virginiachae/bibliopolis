// require dependencies
var mongoose = require('mongoose'),
    bcrypt = require('bcrypt');

// set up shorthand method name
var Schema = mongoose.Schema;

// define admin schema
var adminSchema = new Schema({
    fName: String,
    lName: String,
    email: String,
    img: String,
    passwordDigest: String,
    Children: {
      type: Schema.Types.ObjectId,
      ref: 'Children'
    }
});

// create a new admin with secure (hashed) password
adminSchema.statics.createSecure = function(email, password, fName, lName, img, callback) {
    // `this` references our admin model, since this function will be called from the model itself
    // store it in variable `AdminModel` because `this` changes context in nested callbacks

    var AdminModel = this;

    // hash password admin enters at sign up
    bcrypt.genSalt(function(err, salt) {
        console.log('salt: ', salt); // changes every time
        bcrypt.hash(password, salt, function(err, hash) {
            // create the new admin (save to db) with hashed password
            AdminModel.create({
                fName: fName,
                lName: lName,
                img: img,
                email: email,
                passwordDigest: hash
            }, callback);
        });
    });
};

//checking passwords
adminSchema.methods.checkPassword = function(password) {
    // run hashing algorithm (with salt) on password admin enters in order to compare with `passwordDigest`
    return bcrypt.compareSync(password, this.passwordDigest);
};

// authenticate admin (when admin logs in)
adminSchema.statics.authenticate = function(email, password, callback) {
    // find admin by email entered at log in
    // remember `this` refers to the Admin for methods defined on adminSchema.statics
    this.findOne({
        email: email
    }, function(err, foundAdmin) {
        if (!foundAdmin) {
            console.log('No admin with email ' + email);
            callback("Error: no admin found", null); // better error structures are available, but a string is good enough for now
            // if we found a admin, check if password is correct
        } else if (foundAdmin.checkPassword(password)) {
            callback(null, foundAdmin);
        } else {
            callback("Error: incorrect password", null);
        }
    });
};

// define admin model
var Admin = mongoose.model('Admin', adminSchema);

// export admin model
module.exports = Admin;
