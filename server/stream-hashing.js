const multer = require('multer');
const path = require('node:path');
const { uploadsDir } = require('./config');
const streamHashingStorage = require('./stream-hashing-storage');

const storage = streamHashingStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Math.random().toString(36).substring(7)}${ext}`);
  }
});

const upload = multer({ storage: storage });

exports.streamHashingMiddleware = upload;
