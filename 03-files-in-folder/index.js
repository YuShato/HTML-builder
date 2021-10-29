const fs = require('fs');
const path = require('path/posix');

const testFolder = path.join(__dirname, './secret-folder/');
fs.readdir(testFolder, {
  withFileTypes: true
}, (err, files) => {
  files.forEach(file => {
    if (file.isFile()) {
      fs.stat(path.join(testFolder, file.name), (err, stats) => {
        if (err) {
          console.log('File doesn\'t exist.');
        } else {
          console.log(`${path.parse(file.name).name} - ${path.parse(file.name).ext.slice(1)} - ${Math.round(stats.size / 1000)}kb`);
        }
      });
    }
  });
});