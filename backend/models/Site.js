const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
    siteName: { type: String, required: true },
    location: { type: String },
    type: { type: String, enum: ['HeadOffice', 'Site'], default: 'Site' },
}, { timestamps: true });

const Site = mongoose.model('Site', siteSchema);
module.exports = Site;
