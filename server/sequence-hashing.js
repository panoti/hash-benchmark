const multer = require('multer');
const path = require('node:path');
const { uploadsDir } = require('./config');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
  }
});

const upload = multer({ storage: storage });

exports.sequenceHashingMiddleware = upload;
