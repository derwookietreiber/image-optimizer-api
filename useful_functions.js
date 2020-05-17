const fs = require('fs');
const archiver = require('archiver');
const path = require('path');
const crypto = require('crypto');

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
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(path.posix.join('compressedPics/', `${compressID}.zip`));
    const archive = archiver('zip');

    output.on('close', () => {
      console.log(`${archive.pointer()} total bytes`);
      console.log('archiver has been finalized and the output file descriptor has closed.');
      return resolve('Resolved');
    });

    output.on('end', () => {
      console.log('Data has been drained');
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.log('Make Zip Function Error: ENOENT');
        return reject(err);
      }
      return reject(err);
    });

    archive.on('error', (err) => {
      reject(err);
    });


    archive.pipe(output);
    archive.directory(path.posix.join('compressedPics/', compressID, '/'), false);
    archive.finalize();
  });
};

usefulFunctions.generateChecksum = function generateChecksum(filePath) {
  return new Promise((resolve) => {
    const fileBuffer = fs.readFileSync(filePath);
    resolve(crypto.createHash('md5')
      .update(fileBuffer)
      .digest('hex'));
  });
};
module.exports = usefulFunctions;
