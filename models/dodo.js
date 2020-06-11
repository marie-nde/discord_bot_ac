const mongoose = require('mongoose');

const dodoSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: {
        type: String,
        required: true
    },
    serverID: {
        type: String,
        required: true
    },
    dodocode: {
        type: String,
        required: true
    },
    raison: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Dodo', dodoSchema);