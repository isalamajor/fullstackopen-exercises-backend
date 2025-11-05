require('dotenv').config()
const mongoose = require('mongoose')

mongoose.set('strictQuery',false)
console.log('ENV', process.env.DB_URL)
mongoose.connect(process.env.DB_URL).then(res => {
    console.log("Connected to MongoDB")
}).catch(error => {
    console.log("An error occurred while trying to connect to MongoDB\n", error.message)
})

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})


personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
