const mongoose = require('mongoose');
const moment = require('moment')

// START CREATING AD SCHEMA
const adSchema = new mongoose.Schema({
    title: { type: String, required: true },
    //banner: { data: Buffer, contentType: String },
    banner: { type: String, required: true, trim: true },
    clicks: { type: Number, required: true, default: 0 },
    period: { type: String, required: true },
    e_mail: { type: String, required: true },
    url: { type: String, required: true },
    owner: { type: String, required: true },
    budget: { type: Number, required: true, default: 0 },
    plan_type: { type: String, required: true, trime: true },
    ad_size: { type: String, required: true },
    ad_status: { type: Boolean, default: false, required: true },
    createdAt: { type: String, default: moment().format('DD/MM/YYYY') }
})

// EXOPORT THE MODEL
module.exports = mongoose.model('ads', adSchema);