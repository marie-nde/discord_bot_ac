const mongoose = require('mongoose');

var dt = new Date();
dt.setHours( dt.getHours() + 2 );

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
    },
    createdAt: {
        type: Date,
        expires: 10800,
        default: Date.now
    }
})

module.exports = mongoose.model('Dodo', dodoSchema);