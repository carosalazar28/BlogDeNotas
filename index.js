const express = require('express')
const cookieSession = require('cookie-session')
const app = express()


const logger = (req, res, next) => {
    console.log('Nueva petición HTTP')
    next()
}

app.set('view engine', 'pug')
app.set('views', 'views')
app.use(cookieSession({
    secret: 'Un_secreto',
    maxAge: 24 * 60 * 60 * 1000 
}))
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.use(logger)

app.get('/', (req, res) => {
    const name = req.query.name
    const age = req.query.age
    // res.send(`<h1>Hola ${name}, tienes ${age} años</h1>`)
    req.session.views = (req.session.views || 0) + 1

    const notes = [
        'Nota 1', 'Nota 2', 'Nota 3'
    ]
    res.render('index', {
        notes, 
        views: req.session.views
    })
    
})

app.get('/notes/new', (req, res) => {
    res.render('new')
})

app.post('/notes', (req, res)  => {
    console.log(req.body)
    res.redirect('/')
})

app.get('/users/:name', (req, res) => {
    const name = req.params.name
    res.send(`<h1>Hola ${name}</h1>`)
})

app.post('/users', (req, res) => {
    res.status(404)
    res.set('Content-Type', 'text/plain')
    res.send('Ouppp!! Not Found')
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500)
    res.send('Algo salio mal')
})

app.listen(3000, () => console.log('Listening port 3000...'))