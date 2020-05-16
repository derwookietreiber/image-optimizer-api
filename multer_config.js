const multer = require('multer');
const path = require('path');
const fs = require('fs');
const usefulFunctions = require('./useful_functions');

const maxFileSize = process.env.MAX_FILE_SIZE * 1024 * 1024;

const multerConfig = {};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const folderName = usefulFunctions.makeID(10);
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

multerConfig.uploadFiles = multer({
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
}).array('fileUpload', process.env.MAX_FILES);

multerConfig.fileValidator = function fileValidator(req, res, next) {
  multerConfig.uploadFiles(req, res, async (err) => {
    // No File Supplied
    if (req.files.length === 0) {
      res.status(400).json({
        error: 'Error 400 No file',
      });
      /* istanbul ignore if  */
      if (process.env.DEBUG === 'true') {
        console.log('No file Supplied');
      }
      return;
    }

    // Wrong File MIME
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

    // Multer Error
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
    }

    next();
  });
};

module.exports = multerConfig;
