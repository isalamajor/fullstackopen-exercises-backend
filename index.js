require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const cors = require('cors')
const PORT = process.env.PORT || 3001
const Person =  require('./models/person')



morgan.token('print-post', (req, _res) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return ''
})
const customFormat = ':method :url :status :response-time ms - :res[content-length] :print-post';

const app = express()
app.use(express.json())
app.use(morgan(customFormat))
app.use(cors())
app.use(express.static('dist'))


app.get('/', (req, res) => {
  return res.send('<h1>Server Part 3</h1>')
})

app.get('/persons', async (_req, res) => {
  try {
    const persons = await Person.find({})
    return res.status(200).json(persons)
  } catch (error) {
    return res.status(500).json( { error: error.message } )
  }
})

app.get('/info', async (req, res) => {
  try {
    const persons = await Person.find({})
    return res.send(`
      <p>PhoneBook has info for ${persons.length || 0} ${persons.length === 1 ? "person" : "people"}</p>
      <p>${new Date()}</p>
    `)
  } catch (error) {
    return res.status(500).json({
      error: error.message
    })
  }
})

app.get('/info/:id', async (req, res) => {
  try {
    const data = await Person.findById(req.params.id)
    if (data) {
      return res.status(200).json(data)
    } else {
      return res.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})


app.delete('/persons/:id', async (req, res) => {
  try {
    console.log('id ', req.params.id)
    const deleted = await Person.findByIdAndDelete(req.params.id)
    if (deleted) {
      return res.status(204).end()
    }
    return res.status(404).end()
  } catch (error) {
    return res.status(500).json({
      error: error.message
    })
  }
})


app.post('/persons', async (req, res) => {
  try {
    const newPerson = req.body
    if (!newPerson | !newPerson.name | !newPerson.number) {
      return res.status(400).json({
        error: 'Missing fields'
      }).end()
    }
    const namePhoneTaken = await Person.find({
       $or: [ { name : newPerson.name }, { phone : newPerson.number }]
      })
    if (namePhoneTaken.length !== 0) {
      return res.status(402).json({
        error: 'Name or phone is already registered'
      }).end()
    }
    const newRegister = new Person (newPerson)
    const saved = await newRegister.save()
    return res.status(201).send(saved)
  } catch (error) {
    return res.status(500).json({
      error: error.message
    })
  }
})


app.put('/persons/:id', async (req, res) => {
  try {
    const updatedPerson = req.body
    if (!updatedPerson | !updatedPerson.name | !updatedPerson.number | !updatedPerson.id) {
      return res.status(400).json({
        error: 'Missing fields'
      })
    }
    const updated = await Person.findByIdAndUpdate(updatedPerson.id, updatedPerson, { new : true })
    if (!updated) {
      return res.status(400).json({
        error: `Person with id ${updatedPerson.id} not found`
      })
    }
    return res.status(200).send(updated)
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      error: error.message
    })
  }
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message, request)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

// este debe ser el último middleware cargado, ¡también todas las rutas deben ser registrada antes que esto!
app.use(errorHandler)

app.listen(PORT, () => console.log("Server running in port ", PORT))
