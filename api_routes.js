const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const imageCompressor = require('./compress_engine');

const router = express.Router();

const maxFileSize = process.env.MAX_FILE_SIZE * 1024 * 1024;


function getFilesizeInBytes(filename) {
  const stats = fs.statSync(filename);
  const fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


// //////////////////////////////////////
// ////////   Multer Config    //////////
// //////////////////////////////////////
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const folderName = makeid(10);
    const folderPath = path.posix.join('uploads/', folderName, '/');
    fs.mkdirSync(folderPath);
    /* istanbul ignore if  */
    if (process.env.DEBUG === 'true') {
      console.log('Created folder at: ', folderPath);
    }
    req.compressID = folderName;
    cb(null, folderPath);
  },
  filename(req, file, cb) {
    if (file.mimetype === 'image/jpeg') {
      cb(null, `${Date.now()}.jpg`); // Appending .jpg
    } else if (file.mimetype === 'image/png') {
      cb(null, `${Date.now()}.png`);
    }
  },
});


const uploadSingle = multer({
  limits: {
    fileSize: maxFileSize,
  },
  storage,
  fileFilter(req, file, cb) {
    if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg') {
      req.fileValidationError = 'MIME Type Error';
      return cb(null, false, new Error('MIME Type Error'));
    }
    return cb(null, true);
  },
}).single('fileUpload');

// //////////////////////////////////////
// ////////   Backend Routes   //////////
// //////////////////////////////////////

router.post('/upload', async (req, res) => {
  uploadSingle(req, res, async (err) => {
    if (req.fileValidationError) {
      res.status(400).send({
        error: 'Error 400 Wrong File Format',
      });
      /* istanbul ignore if  */
      if (process.env.DEBUG === 'true') {
        console.log('Failed at Wrong File Format');
      }
      return;
    }
    if (err) {
      let errorMessage = '';
      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          errorMessage = 'Error 400 File Size Exceeded';
          break;
        default:
          res.status(400).json({
            error: 'Error 400 Bad Request',
          });
          return;
      }
      /* istanbul ignore if  */
      if (process.env.DEBUG === 'true') {
        console.log(err);
      }
      res.status(400).json({
        error: errorMessage,
      });
      return;
    }
    if (!req.file) {
      res.status(400).json({
        error: 'Error 400 No file',
      });
      /* istanbul ignore if  */
      if (process.env.DEBUG === 'true') {
        console.log('No file Supplied');
      }
      return;
    }
    if (req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/png') {
      /* istanbul ignore if  */
      if (process.env.DEBUG === 'true') {
        console.log(req.file);
      }
      const imagePath = path.posix.join(req.file.destination, req.file.filename);
      const originalSize = getFilesizeInBytes(imagePath);
      const newImagePath = path.join('compressedPics/', req.compressID, '/', req.file.filename);
      const timeElapsed = await imageCompressor.compressJPEG(imagePath, path.posix.join('compressedPics/', req.compressID));
      if (!timeElapsed) {
        res.status(500).json({
          error: '500 - Internal Server Error',
        });
        return;
      }
      const newSize = getFilesizeInBytes(newImagePath);
      const percentReduction = 100 - ((newSize * 100) / originalSize);
      res.status(200).json({
        timeElapsed,
        originalSize,
        newSize,
        reduction: percentReduction,
        downloadLink: `/download?compressID=${req.compressID}&fileName=${req.file.filename}`,
        timestamp: new Date(),
      });
    }
  });
});

router.get('/download', (req, res) => {
  res.download(path.join('compressedPics/', req.query.compressID, '/', req.query.fileName));
});

router.use((req, res) => {
  res.status(404).json({
    error: '404 Path not Found',
  });
});

module.exports = router;
