const fs = require('fs');
const del = require('del');

const folderManager = {};

// Creates Upload and CompressedPics folder if not present
// Needs to run sync or else we could send files without the folder existing
folderManager.checkFolders = function checkFolders() {
  // Compressed Pics Folder
  try {
    fs.accessSync('compressedPics', fs.constants.F_OK);
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      fs.mkdirSync('compressedPics/');
      /* istanbul ignore if  */
      if (process.env.DEBUG === 'true') {
        console.log('Created Uploads Folder');
      }
    }
  }
  // Uploads Folder
  try {
    fs.accessSync('uploads', fs.constants.F_OK);
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      fs.mkdirSync('uploads/');
      /* istanbul ignore if  */
      if (process.env.DEBUG === 'true') {
        console.log('Created Uploads Folder');
      }
    }
  }
};

folderManager.clearFolders = async function clearFolders() {
  if (process.env.DELETE_ON_START) {
    (async () => {
      await del(['compressedPics/*', 'uploads/*']);
    })();
  }
};

module.exports = folderManager;
