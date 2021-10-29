const fs = require('fs');
const path = require('path/posix');
const { stdout } = require('process');

const stream = fs.createReadStream(
  path.join(__dirname, '/text.txt'),
  'utf8'
);

stream.on('data', (data) => stdout.write(data));
stream.on('error', (err) => stdout.write(`Err: ${err}`));
