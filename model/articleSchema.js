const mongoose = require('mongoose');
const moment = require('moment'); // DATE FORMATING MODULE


// DEFAULT IMG 
//const IMG_URL = 'https://images.unsplash.com/photo-1580894908361-967195033215?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80';

// CREATE ARTICLE SCHEMA 
const articleSchema = new mongoose.Schema({
    title: { type: String, trim: true, required: true },
    body: { type: String, trim: true, required: true },
    //poster_url: { data: Buffer, contentType: String },
    poster_url: { data: Buffer, contentType: String },
    author: { type: String, trim: true, default: 'Admin' },
    topic: { type: String, trim: true },
    views: { type: Number, trim: true, default: 0 },
    date: { type: String, default: moment().format('DD/MM/YYYY') }
});


// EXPORT ARTICLE SCHEMA MODULE
module.exports = mongoose.model('articles', articleSchema);