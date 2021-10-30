const mongoose = require('mongoose');

// CREATE ADMIN SCHEMA 
const adminSchema = new mongoose.Schema({
    email: { type: String, trim: true, required: true },
    username: { type: String, trim: true, required: true },
    password: { type: String, trim: true, required: true },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    createdAt: { type: Date, default: new Date().toDateString() }
});

module.exports = mongoose.model('admins', adminSchema)