const mongoose = require('mongoose');

const badgeSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: {
        type: String,
        required: true
    },
    serverID: {
        type: String,
        required: true
    },
    allTitles: [
        { type: String }
    ],
    title: {
        type: String
    },
    badgeMsg: {
        type: Number,
        default: 0
    },
    badgeDodo: {
        type: Number,
        default: 0
    },
    badgeCard: {
        type: Number,
        default: 0
    },
    badgeWish: {
        type: Number,
        default: 0
    },
    badgeSearch: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model('Badge', badgeSchema);