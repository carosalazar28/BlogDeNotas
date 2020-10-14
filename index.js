const express = require('express')
const mongoose = require('mongoose')
const Note = require('./models/Note')
const cookieSession = require('cookie-session')
const app = express()

mongoose.connect('mongodb://localhost:27017/notes', { useNewUrlParser: true })

app.set('view engine', 'pug')
app.set('views', 'views')
app.use(cookieSession({
    secret: 'Un_secreto',
    maxAge: 24 * 60 * 60 * 1000 
}))
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))

app.get('/', async (req, res) => {
    const notes = await Note.find()
    res.render('index', {
        notes
    })
    
})

app.get('/notes/new', (req, res) => {
    res.render('new')
})

app.post('/notes', async (req, res, next)  => {
    const data = {
        title: req.body.title,
        body: req.body.body
    }
    try {
        const note = new Note(data)
        await note.save()
    } catch(err) {
        return next(err)
    }
    
    res.redirect('/')
})

app.listen(3000, () => console.log('Listening port 3000...'))