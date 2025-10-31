const express = require('express')
var morgan = require('morgan')
const cors = require('cors')
const fs = require('fs');
const persons = require('./persons.json')
const PORT = process.env.PORT || 3001


morgan.token('print-post', (req, res) => {
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


app.get('/', (req, res) => {
  return res.send('<h1>Server Part 3</h1>')
})

app.get('/persons', (req, res) => {
  return res.json(persons)
})

app.get('/info', (req, res) => {
  return res.send(`
    <p>PhoneBook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
  `)
})

app.get('/info/:id', (req, res) => {
  const data = persons.filter(p => p.id.toString() === req.params.id)
  if (data && data.length > 0) {
    return res.status(200).json(persons.filter(p => p.id.toString() === req.params.id))
  } else { return res.status(404).end()}
})


function deleteRecordFromJson(id) {
    try {
      personsUpdated = persons.filter(p => p.id !== id); 

      if (personsUpdated.length === persons.length) {
          console.log(`Registro con ID ${id} no encontrado.`);
          return false;
      }

      const updatedJson = JSON.stringify(personsUpdated, null, 2); // 'null, 2' para un formato legible (indentación de 2 espacios)
      fs.writeFileSync('./persons.json', updatedJson, 'utf8');

      console.log(`Registro con ID ${id} eliminado exitosamente.`);
      return true;

    } catch (error) {
      console.error('Ocurrió un error al procesar el archivo JSON:', error.message);
      return false;
    }
}

app.delete('/persons/:id', (req, res) => {
  const deleted = deleteRecordFromJson(Number(req.params.id))
  if (deleted) {
    return res.status(204).end()
  } 
  return res.status(404).end()
})


function addRecordToJson(newPerson) {
    try {
      newPerson.id = Math.floor(Math.random() * 10000)
      personsUpdated = [...persons, newPerson]

      const updatedJson = JSON.stringify(personsUpdated, null, 2);
      fs.writeFileSync('./persons.json', updatedJson, 'utf8');
      return true;

    } catch (error) {
      console.error('Ocurrió un error al procesar el archivo JSON:', error.message);
      return false;
    }
}

app.post('/persons', (req, res) => {
  const newPerson = req.body
  if (!newPerson | !newPerson.name | !newPerson.number) {
    return res.status(400).json({
      error: 'Missing fields'
    }).end()
  } 
  if (persons.filter(p => p.name === newPerson.name).length > 0) {
    return res.status(402).json({
      error: 'Name is already registered'
    }).end()
  }
  if (addRecordToJson(newPerson)) {
    return res.status(200).send(newPerson)
  }
  return res.status(403).end()

})

function updateRecordInJson(newPerson) {
    try {
      personsUpdated = persons.map(p => 
        p.id === newPerson.id ? newPerson : p
      )

      const updatedJson = JSON.stringify(personsUpdated, null, 2);
      fs.writeFileSync('./persons.json', updatedJson, 'utf8');
      return true;

    } catch (error) {
      console.error('Ocurrió un error al procesar el archivo JSON:', error.message);
      return false;
    }
}

app.put('/persons/:id', (req, res) => {
  const updatedPerson = req.body
  if (!updatedPerson | !updatedPerson.name | !updatedPerson.number | !updatedPerson.id) {
    return res.status(400).json({
      error: 'Missing fields'
    })
  }
  if (persons.filter(p => p.id === updatedPerson.id).length < 1) {
    return res.status(400).json({
      error: `Person with id ${updatedPerson.id} not found`
    })
  }

  if (updateRecordInJson(updatedPerson)) {
    return res.status(200).send(updatedPerson)
  }
  return res.status(400).json({
    error: 'Something went wrong when updating the register'
  })
})

app.listen(PORT, () => console.log("Server running in port ", PORT))
