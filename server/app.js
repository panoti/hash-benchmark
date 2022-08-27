require('newrelic');
const fs = require('node:fs');
const crypto = require('node:crypto');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequenceHashingMiddleware } = require('./sequence-hashing');
const { streamHashingMiddleware } = require('./stream-hashing');

const config = {
  port: 8000,
};

const uploadRouter = express.Router();

uploadRouter.post('/sequence-hasing', sequenceHashingMiddleware.single('file'), (req, res) => {
  const hashSum = crypto.createHash('sha1').setEncoding('hex');
  fs.createReadStream(req.file.path).pipe(hashSum);

  hashSum.once('finish', () => {
    res.status(200).json({
      sha1: hashSum.read()
    });
    fs.unlinkSync(req.file.path);
  });
});

uploadRouter.post('/stream-hasing', streamHashingMiddleware.single('file'), (req, res) => {
  res.status(200).json({
    sha1: req.file.checksum
  });
  fs.unlinkSync(req.file.path);
});

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(uploadRouter);

app.listen(config.port, () => console.log(`Server running on port ${config.port}...`));

module.exports = app;
