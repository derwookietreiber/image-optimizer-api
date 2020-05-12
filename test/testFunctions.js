const fs = require('fs');
const del = require('del');

const testFunctions = {};

// Function which deletes the uploads and compressed Pics folder and
// therefore triggers the create new folder on startup function.
// Needs to run sync or else we´ll get in trouble.

testFunctions.deleteFolders = function deleteFolders() {
  try {
    fs.accessSync('compressedPics', fs.constants.F_OK);
    del.sync('compressedPics/');
    if (process.env.DEBUG === 'true') {
      console.log('Deleted Compressed Pics');
    }
  } catch (error) {
    if (process.env.DEBUG === 'true') {
      console.log(error.code);
    }
  }
  try {
    fs.accessSync('uploads', fs.constants.F_OK);
    del.sync('uploads/');
    if (process.env.DEBUG === 'true') {
      console.log('Deleted Uploads Folder');
    }
  } catch (error) {
    if (process.env.DEBUG === 'true') {
      console.log(error.code);
    }
  }
};

module.exports = testFunctions;
