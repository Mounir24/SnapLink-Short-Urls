const mongoose = require('mongoose');
const moment = require('moment');

// CREATE USER SCHEMA 
// CREATE NEW NESTED DOCUMENTS (PRIVATE URLS)
/*const private_url_schema = new mongoose.Schema({
    url: { type: String, trim: true, required: true },
    original_url: { type: String, trim: true, required: true },
    date: { type: Date, default: moment().format('DD/MM/YYYY') },
    clicks: { type: String, default: 0 },
    sources: [],
})*/
// SOURCE OBJECT SCHEMA 
/*const sourceSchema = new mongoose.Schema({
    source: { type: String, default: '' },
    visites: { type: Number, default: 0 }
});*/

const userSchema = new mongoose.Schema({
    email: { type: String, trim: true, required: true },
    username: { type: String, trim: true, required: true },
    password: { type: String, trim: true },
    geo: [],
    isBlocked: { type: Boolean, default: false },
    private_urls: [],
    sources: [],
    is2FEnable: { type: Boolean, default: false },
    role: { type: String, default: 'user' },
    login_token: { type: String, default: '' },
    joined_at: { type: String, default: moment().format('DD/MM/YYYY') }

})

module.exports = mongoose.model('users', userSchema);