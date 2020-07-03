const mongoose = require('mongoose');

const pnjSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: {
        type: String,
        required: true
    },
    serverID: {
        type: String,
        required: true
    },
    pnj: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Pnj', pnjSchema);