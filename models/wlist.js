const mongoose = require('mongoose');

const wlistSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: {
        type: String,
        required: true
    },
    serverID: {
        type: String,
        required: true
    },
    users: [
        { type: String }
    ],
    number: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Wlist', wlistSchema);