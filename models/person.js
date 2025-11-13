require('dotenv').config()
const mongoose = require('mongoose')

mongoose.set('strictQuery',false)
console.log('ENV', process.env.DB_URL)
mongoose.connect(process.env.DB_URL).then(_res => {
    console.log("Connected to MongoDB")
}).catch(error => {
    console.log("An error occurred while trying to connect to MongoDB\n", error.message)
})

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [3, 'Name must be at least 3 characters long ']
  },
  number: {
    type: String,
    minLength: 8,
    match: [/^\d{2,3}-\d+$/, 'Phone must contain 2-3 numbers, then "-", and then more numbers']
   }
})


personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
