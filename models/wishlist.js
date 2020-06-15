const mongoose = require('mongoose');

const wishlistSchema = mongoose.Schema({
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

module.exports = mongoose.model('Wishlist', wishlistSchema);