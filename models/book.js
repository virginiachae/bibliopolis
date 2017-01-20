// require dependencies
var mongoose = require('mongoose');

// set up shorthand method name
var Schema = mongoose.Schema;

// define user schema
var BookSchema = new Schema({
    title: String,
    author: String,
    ageRange: String,
    img: String,
		rentalDue: String,
		fee: Number,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
		child: {
      type: Schema.Types.ObjectId,
      ref: 'Children'
    }
});

// define user model
var Book = mongoose.model('Book', BookSchema);

// export user model
module.exports = Book;
