const mongoose = require('mongoose');

// CREATE SUSCBRIBE NEWSLETTER BLOGS SCHEMA
const subscribeSchema = new mongoose.Schema({
    email: { type: String, trim: true, required: true }
});

module.exports = mongoose.model('subscribers', subscribeSchema);