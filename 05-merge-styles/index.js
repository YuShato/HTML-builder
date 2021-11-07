const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

const sourceFolder = path.join(__dirname, 'styles');
const targetResultFolder = path.join(__dirname, 'project-dist', 'bundle.css');
const styleFileExtends = '.css';

const createBundleCss = (sourceTargetFolder, resultTargetFolder) => {

  const newFile = fs.createWriteStream(resultTargetFolder);

  fs.access(sourceTargetFolder, (err) => {
    if (err) throw err;

    fsPromises.readdir(sourceTargetFolder, { withFileTypes: true })
      .then(data => {
        data.forEach(item => {
          if (!item.isFile() || path.extname(item.name) !== styleFileExtends) return;

          let content = fs.createReadStream(path.join(sourceTargetFolder, item.name), 'utf-8');
          content.on('data', (text) => newFile.write(text.trim() + '\n\n'));
        });
        console.log('Файл bundle.css создан.');
      })
      .catch(err => console.log(err));
  });
};

createBundleCss(sourceFolder, targetResultFolder);

module.exports = createBundleCss;