const express = require('express')
const mongoose = require('mongoose')
const Note = require('./models/Note')
const User = require('./models/User')
const cookieSession = require('cookie-session')
const md = require('marked')
const app = express()
const multer = require('multer')
const PORT = process.env.PORT || 3000

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notes', { useNewUrlParser: true })

app.set('view engine', 'pug')
app.set('views', 'views')

app.use(cookieSession({
    secret: 'Un_secreto',
    maxAge: 24 * 60 * 60 * 1000 
}))
app.use(express.urlencoded({extended: true}))
app.use('/assets', express.static('assets'))
app.use('/uploads', express.static('uploads'))

//middleware para configurar las imagenes
const upload = multer({dest: 'uploads/'})

//middleware para revisar si el usuario existe
const requireUser = (req, res, next) => {
    if(!res.locals.user) {
        return res.redirect('/login')
    }
    next()
}

//middleware para autenticación
app.use(async (req, res, next) => {
    const userId = req.session.userId
    if(userId) {
        const user = await User.findById(userId)
        if(user) {
            res.locals.user = user
        } else {
            delete req.session.userId
        }
    }
    next()
})

//ruta para la lista de notas
app.get('/', requireUser, async (req, res) => {
    const notes = await Note.find({
        user: res.locals.user
    })
    res.render('index', {
        notes
    })
    
})

//ruta para crear una nota
app.get('/notes/new', requireUser, async (req, res) => {
    const notes = await Note.find({
        user: res.locals.user
    })
    res.render('new', {
        notes
    })
})

//ruta para crear una nota
app.post('/notes', requireUser, upload.single('image'), async (req, res, next)  => {
    console.log(req.file)
    const data = {
        title: req.body.title,
        body: req.body.body,
        user: res.locals.user,
        image: req.file.filename,
    }
    try {
        const note = new Note(data)
        await note.save()
    } catch(err) {
        return next(err)
    }
    
    res.redirect('/')
})

//ruta para mostrar una nota
app.get('/notes/:id', requireUser, async (req, res) => {
    const notes = await Note.find({
        user: res.locals.user
    })
    const note = await Note.findById(req.params.id)
    res.render('show', {
        notes: notes,
        currentNote: note,
        md: md,
    })
})

//ruta para editar una nota
app.get('/notes/:id/edit', requireUser, async (req, res, next) => {
    try {
        const notes = await Note.find({
            user: res.locals.user
        })
        const note = await Note.findById(req.params.id)

        res.render('edit', {
            notes: notes,
            currentNote: note,
        })
    } catch(err) {
        return next(err)
    }
})

//metodo para actualizar una nota
app.patch('/notes/:id', requireUser, async (req, res, next) => {
    const id = req.params.id
    const note = await Note.findById(id)

    note.title = req.body.title
    note.body = req.body.body

    try {
        await note.save({})
    } catch(err) {
        return next(err)
    }

    res.status(204)
    res.send({})
})

//ruta para eliminar una nota
app.delete('/notes/:id', requireUser, async (req, res, next) => {
    try {
        await Note.deleteOne({
        _id: req.params.id
        })
    }catch(err) {
        return next(err)
    }
    
    res.status(204)
    res.send({})
})

//ruta para registrarse
app.get('/register', (req, res) => {
    res.render('register')
})

//ruta para enviar el registro
app.post('/register', async (req, res, next) => {
    try {
        const user = await User.create({
            email: req.body.email,
            password: req.body.password,
        })
    }catch(err) {
        return next(err)
    }
    res.redirect('/login')
})

//ruta para hacer login
app.get('/login', (req, res) => {
    res.render('login')
})

//ruta para enviar el login y conectar con la base de datos
app.post('/login', async (req, res, next) => {
    try {
        const user = await User.authenticate(req.body.email, req.body.password)
        if(user) {
            req.session.userId = user._id
            return res.redirect('/')
        } else {
            res.render('login', {error: 'Wrong email or password. try again!'})
        }
    }catch(err) {
        return next(err)
    }

})

//ruta para hacer logout
app.get('/logout', requireUser, (req, res) => {
    res.session = null
    res.clearCookie('session')
    res.clearCookie('session.sig')
    res.redirect('/login')
})

// app.use((err, req, res, next) => {
//     res.status(500)
//     res.send('<h1>Error inesperado</h1><p>${err.message}</p>')
// })

app.listen(PORT, () => console.log(`Listening port ${PORT}...`))