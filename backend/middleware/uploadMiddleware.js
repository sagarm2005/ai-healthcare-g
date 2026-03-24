import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads')); // files will be saved in a top-level 'uploads' folder
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
];

function checkFileType(file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();
    const extensionAllowed = allowedExtensions.includes(extension);
    const mimeAllowed = allowedMimeTypes.includes(file.mimetype);

    if (extensionAllowed && mimeAllowed) {
        return cb(null, true);
    }

    cb(new Error('Only PDF, JPG, PNG, DOC, and DOCX files are allowed'));
}

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

export { upload };
