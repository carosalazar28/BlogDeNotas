const mongoose = require('mongoose') 

const NoteSchema = mongoose.Schema({
    title: {type: String, require: true},
    body: String,
})

const Note = mongoose.model('Note', NoteSchema)

module.exports = Note