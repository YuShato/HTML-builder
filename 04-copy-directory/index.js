const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

const sourcePath = path.join(__dirname, 'files');
const resultPath = path.join(__dirname, 'files-copy');

const checkSourceFolder = (folderName, cb, agsListCb = []) => {
  fsPromises.readdir(folderName, {
    withFileTypes: true
  })
    .then((data) => {
      cb(data, folderName, ...agsListCb);
    })
    .catch(err => {
      throw err;
    });
};

const copySourceFolder = (filesList, sourceFolder, resultFolder) => {
  if (!filesList) return;

  filesList.forEach(singleFile => {
    if (singleFile.isFile()) {
      fs.copyFile(
        path.join(sourceFolder, singleFile.name),
        path.join(resultFolder, singleFile.name),
        () => {}
      );
    } else {
      const resultFolderPath = path.join(resultFolder, singleFile.name);

      fsPromises.mkdir(resultFolderPath, {
        recursive: true
      })
        .then(() => {
          checkSourceFolder(
            path.join(sourceFolder, singleFile.name),
            copySourceFolder,
            [resultFolderPath]
          );
        })
        .catch(err => {
          throw err;
        });
    }
  });
};

const copyDirectory = (sourcePath, resultPath) => {
  fsPromises.rm(resultPath, {
    force: true,
    recursive: true
  }).then(() => {
    console.log('Wait a minute. Removing old files...');
  })
    .then(() => {
      fsPromises.mkdir(resultPath, {
        recursive: true
      })
        .then(() => {
          checkSourceFolder(sourcePath, copySourceFolder, [resultPath]);
          console.log('New copies created');
        })
        .catch((err) => {
          throw err;
        });
    });
};

copyDirectory(sourcePath, resultPath);

module.exports = copyDirectory;