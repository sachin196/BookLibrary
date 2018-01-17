const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Schema = mongoose.Schema
 
const bookSchema = Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  author: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    trim: true,
  },
  imagePath:{ 
    type:String,
  },
  genre: [{
    type: Schema.Types.ObjectId,
    ref: 'Genre',
    isChecked: true
  }]
})
 
module.exports = mongoose.model('Book', bookSchema)