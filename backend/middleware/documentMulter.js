const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'hrms_documents',
        resource_type: 'auto', // Allows non-image files like pdf, docx, etc.
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv']
    },
});

const uploadDocument = multer({ 
    storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20 MB limit
});

module.exports = uploadDocument;
