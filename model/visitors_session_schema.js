const mongoose = require('mongoose')
const moment = require('moment');
// START CREATING : VISITORS_SESSION MODEL
const VISITORS_SESSION_SCHEMA = new mongoose.Schema({
    slugs: [],
    ip: { type: String, default: '0.0.0.0' },
    session_id: { type: String, trim: true, default: '' },
    expiryDate: { type: String, default: moment().format('DD/MM/YYYY') }
})

module.exports = mongoose.model('visitors_session', VISITORS_SESSION_SCHEMA);