require('dotenv').config()
const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

let newName, newPhone
if (process.argv.length === 4) {
  console.log('one argument is missing')
  process.exit(1)
}
if (process.argv.length === 5) {
  newName = process.argv[3]
  newPhone = process.argv[4]
}



mongoose.set('strictQuery',false)

mongoose.connect(process.env.DB_URL)

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


const Person = mongoose.model('Person', personSchema)

if (newName && newPhone) {
    const newPerson = new Person({
    name: newName,
    number: newPhone,
    })
    newPerson.save().then(_result => {
      console.log(`added ${newName} number ${newPhone} to phonebook`)
      mongoose.connection.close()
    })
}

else

Person.find().then(people => {
    if (people) {
        console.log('phonebook')
        people.forEach(p => {
            console.log(p.name, p.number)
        })
    }
    mongoose.connection.close()
})