const mongoose = require('mongoose');

// CREATING URL SCHEMA 
const urlSchema = new mongoose.Schema({
    original_url: { type: String, required: true, trim: true },
    short_url: { type: String, trim: true, required: true },
    clicks: { type: Number, default: 0 },
    qrcode: { type: String },
    createdBy: { type: String, trim: true, required: true },
    sources: [],
    date: { type: String, default: new Date().toDateString() }
});

module.exports = mongoose.model('urls', urlSchema);