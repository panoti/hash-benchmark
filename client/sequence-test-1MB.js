import http from 'k6/http';
import crypto from 'k6/crypto';
import { check } from 'k6';
import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';


export default function () {
  const binFile = crypto.randomBytes(1000000); // 1MB
  const fd = new FormData();
  fd.append('file', http.file(binFile, 'test.bin'));

  const res = http.post('http://192.168.1.68:9622/sequence-hasing', fd.body(), {
    headers: { 'Content-Type': 'multipart/form-data; boundary=' + fd.boundary },
  });
  check(res, {
    'is status 200': (r) => r.status === 200,
  });
}
