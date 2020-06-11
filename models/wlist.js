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
    user1: {
        type: String,
    },
    user2: {
        type: String,
    },
    user3: {
        type: String,
    },
    user4: {
        type: String,
    },
    user5: {
        type: String,
    },
    user6: {
        type: String,
    },
    user7: {
        type: String,
    },
    user8: {
        type: String,
    },
    user9: {
        type: String,
    },
    user10: {
        type: String,
    },
    num: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Wlist', wlistSchema);