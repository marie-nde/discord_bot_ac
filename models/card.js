const mongoose = require('mongoose');

const cardSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: {
        type: String,
        required: true
    },
    serverID: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Card', cardSchema);