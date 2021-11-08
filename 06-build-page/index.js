const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

const copyDirectory = require('../04-copy-directory');
const createBundleCss = require('../05-merge-styles');

const Setting = {
  FOLDER: {
    components: 'components',
    projectDist: 'project-dist',
    styles: 'styles',
    assets: 'assets'
  },
  FORMAT: {
    utf8: 'utf-8',
  },
  EXTEND: {
    html: '.html',
  },
  FILE: {
    style: 'style.css',
    index: 'index.html',
    template: 'template.html',
  }
};

function checkFolder(folderName, cb, arrArgsForCB) {
  fs.access(folderName, (err) => {
    if (err) {
      fsPromises.mkdir(folderName, {
        recursive: true
      })
        .then(() => cb(...arrArgsForCB));
    } else {
      cb(...arrArgsForCB);
    }
  });
}

function readSourceFolder(readFolderUrl, cbForData, arrArgsForCB) {
  fsPromises.readdir(readFolderUrl, {
    withFileTypes: true
  })
    .then(data => cbForData(data, ...arrArgsForCB))
    .catch(err => console.log(err));
}

function copySourceFiles(data, sourceTargetFolder, resultTargetFolder) {
  data.forEach(item => {
    if (item.isFile()) {
      fsPromises.copyFile(
        path.join(sourceTargetFolder, item.name),
        path.join(resultTargetFolder, item.name)
      )
        .catch(err => console.log(err));

    } else {
      checkFolder(
        path.join(resultTargetFolder, item.name),
        copyDirectory,
        [
          path.join(sourceTargetFolder, item.name),
          path.join(resultTargetFolder, item.name)
        ]
      );
    }
  });
}

function copySourceFolder(sourceFolder, resultFolderName) {
  const sourceFolderAssets = path.join(__dirname, sourceFolder);
  const resultFolderAssets = path.join(__dirname, resultFolderName, sourceFolder);

  checkFolder(
    resultFolderAssets,
    readSourceFolder,
    [
      sourceFolderAssets,
      copySourceFiles,
      [
        sourceFolderAssets,
        resultFolderAssets
      ]

    ]
  );
}

function cbForComponents(data, resultFileHtml) {
  const outputHTMLContent = fs.createReadStream(resultFileHtml, Setting.FORMAT.utf8);
  const regForVarients = /{{.*}}/gi;


  outputHTMLContent.on('data', (textData) => {
    const arrComponentsInHTML = textData.match(regForVarients);
    let newContent = textData;

    arrComponentsInHTML.forEach(item => {
      const itemName = item.slice(2, -2);

      data.forEach(singleComponent => {
        if (singleComponent.name == itemName + Setting.EXTEND.html) {
          const sourceComponentPath = path.join(__dirname, Setting.FOLDER.components, singleComponent.name);
          const componentComtent = fs.createReadStream(sourceComponentPath, Setting.FORMAT.utf8);

          componentComtent.on('data', (input) => {
            newContent = newContent.replace(item, input);
          });

          componentComtent.on('end', () => {
            fs.writeFile(resultFileHtml, newContent, (err) => {
              if (err) throw err;
            });
          });
        }
      });
    });
  });
}

function bundleHtmlFile() {
  const sourceFileHtml = path.join(__dirname, Setting.FILE.template);
  const resultFileHtml = path.join(__dirname, Setting.FOLDER.projectDist, Setting.FILE.index);
  const sourceComponentsFolder = path.join(__dirname, Setting.FOLDER.components);

  fsPromises.copyFile(sourceFileHtml, resultFileHtml)
    .then(() => {
      readSourceFolder(sourceComponentsFolder, cbForComponents, [resultFileHtml]);
    })
    .catch(err => console.log(err));
}

function buildContentInNewDirectory(outputPlaceAssets, resultFolderName) {
  const cssFolder = path.join(__dirname, Setting.FOLDER.styles);
  const outputCssFolder = path.join(__dirname, Setting.FOLDER.projectDist, Setting.FILE.style);

  checkFolder(
    outputPlaceAssets,
    copySourceFolder,
    [
      Setting.FOLDER.assets,
      resultFolderName
    ]
  );

  createBundleCss(cssFolder, outputCssFolder);
  bundleHtmlFile();
}

function buildPage(resultFolderName) {
  const outputPlace = path.join(__dirname, resultFolderName);
  const outputPlaceAssets = path.join(outputPlace, Setting.FOLDER.assets);

  checkFolder(
    outputPlace,
    buildContentInNewDirectory,
    [
      outputPlaceAssets,
      resultFolderName
    ]
  );
}

buildPage(Setting.FOLDER.projectDist);