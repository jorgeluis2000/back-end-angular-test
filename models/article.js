'use strict'

const mongoose = require('mongoose');

var ArticleShema = mongoose.Schema({
    title: String,
    content: String,
    date: { type: Date, default: Date.now },
    image: String
});


module.exports = mongoose.model('Article', ArticleShema);