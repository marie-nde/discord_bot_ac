const mongoose = require('mongoose');

const craftSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: {
        type: String,
        required: true
    },
    serverID: {
        type: String,
        required: true
    },
    list: [
        { type: String }
    ],
    number: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Craft', craftSchema);