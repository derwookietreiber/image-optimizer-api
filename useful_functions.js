const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

const usefulFunctions = {};

usefulFunctions.getFileSizeInBytes = function getFileSizeInBytes(filename) {
  const stats = fs.statSync(filename);
  const fileSizeInBytes = stats.size;
  return fileSizeInBytes;
};

usefulFunctions.makeID = function makeID(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

usefulFunctions.makeZip = function makeZip(compressID) {
  const output = fs.createWriteStream(path.posix.join('compressedPics/', `${compressID}.zip`));
  const archive = archiver('zip');

  output.on('close', () => {
    console.log(`${archive.pointer()} total bytes`);
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  output.on('end', () => {
    console.log('Data has been drained');
  });

  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.log('Make Zip Function Error: ENOENT');
    } else {
      throw err;
    }
  });

  archive.on('error', (err) => {
    throw err;
  });


  archive.pipe(output);
  // archive.glob(`compressedPics/${compressID}/*.jpg`);
  archive.directory(path.posix.join('compressedPics/', compressID, '/'), false);

  archive.finalize();
};
module.exports = usefulFunctions;
