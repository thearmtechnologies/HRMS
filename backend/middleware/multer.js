const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
        const folderName = file.fieldname === 'image' ? 'avin' : 'hrms_employee_docs';
        const params = {
            folder: folderName,
            allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
            resource_type: isPdf ? 'raw' : 'image'
        };
        if (!isPdf) {
            params.transformation = [{ quality: "auto:low", fetch_format: "auto" }];
        }
        return params;
    },
});

const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|pdf)$/i)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and PDF files are allowed.'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB server file size validation
});

module.exports = upload;

