const mongoose = require('mongoose');

const dataSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: {
        type: String,
        required: true
    },
    serverID: {
        type: String,
        required: true
    },
    pseudo: {
        type: String,
        required: true
    },
    ile: {
        type: String,
        required: true
    },
    fruit: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        default: 'Pas de bio, pour la modifier : \`ac!bio \"Exemple\"\`'
    },
})

module.exports = mongoose.model('Data', dataSchema);