const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { PassThrough } = require('node:stream');
const mkdirp = require('mkdirp');

function getFilename(req, file, cb) {
  crypto.randomBytes(16, function (err, raw) {
    cb(err, err ? undefined : raw.toString('hex'));
  });
}

function getDestination(req, file, cb) {
  cb(null, os.tmpdir());
}

function StreamHashingStorage(opts) {
  this.getFilename = (opts.filename || getFilename);

  if (typeof opts.destination === 'string') {
    mkdirp.sync(opts.destination);
    this.getDestination = function ($0, $1, cb) {
      cb(null, opts.destination);
    };
  } else {
    this.getDestination = (opts.destination || getDestination);
  }
}

StreamHashingStorage.prototype._handleFile = function _handleFile(req, file, cb) {
  const that = this;

  that.getDestination(req, file, function (err, destination) {
    if (err) return cb(err);

    that.getFilename(req, file, function (err, filename) {
      if (err) return cb(err);

      const finalPath = path.join(destination, filename);
      const outStream = fs.createWriteStream(finalPath);

      const passThrough = new PassThrough();
      const sha1Hash = crypto.createHash('sha1').setEncoding('hex');
      const deferred = new Promise((resolve, reject) => {
        sha1Hash.once('error', (err) => reject(err));
        sha1Hash.once('finish', () => resolve(sha1Hash.read()));
      });

      passThrough.pipe(sha1Hash);
      file.stream.pipe(passThrough).pipe(outStream);

      outStream.on('error', cb);
      outStream.on('finish', async () => {
        const sha1Hex = await deferred; // make sure hash's done

        sha1Hash.destroy();
        cb(null, {
          destination: destination,
          filename: filename,
          path: finalPath,
          size: outStream.bytesWritten,
          checksum: sha1Hex
        });
      });
    });
  });
}

StreamHashingStorage.prototype._removeFile = function _removeFile(req, file, cb) {
  var path = file.path;

  delete file.destination;
  delete file.filename;
  delete file.path;

  fs.unlink(path, cb);
}

module.exports = function (opts) {
  return new StreamHashingStorage(opts);
}
