// require dependencies
var mongoose = require('mongoose');

// set up shorthand method name
var Schema = mongoose.Schema;

// define user schema
var ChildrenSchema = new Schema({
    fullName: String,
    img: String,
    parentContact: String,
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Parent'
    },
		books: [{
      type: Schema.Types.ObjectId,
      ref: 'Book'
    }]
});

// define user model
var Children = mongoose.model('Children', ChildrenSchema);

// export user model
module.exports = Children;
