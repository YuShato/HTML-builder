const {
  promises: fs,
  stat,
} = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '/files');
const resultPath = path.join(__dirname, '/files-copy');

async function deleteDirectory(dest) {
  await fs.rm(dest, {
    recursive: true
  }, (err) => {
    if (err) {
      console.error(err);
    }
  });
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, {
    recursive: true
  });
  let entries = await fs.readdir(src, {
    withFileTypes: true
  });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    entry.isDirectory() ?
      await copyDir(srcPath, destPath) :
      await fs.copyFile(srcPath, destPath);
  }
}

async function checkOldFiles(targetPath) {
  stat(targetPath, function (err) {
    if (!err) {
      console.log('Wait a minute. Removing old files...');
      deleteDirectory(resultPath);
    }
  });
}

checkOldFiles(resultPath).then(setTimeout(() => {
  copyDir(sourcePath, resultPath);
  console.log('New copies created');
}, 300));