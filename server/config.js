const path = require('node:path');
const fs = require('node:fs');

const uploadsDir = path.resolve(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

exports.uploadsDir = uploadsDir;
