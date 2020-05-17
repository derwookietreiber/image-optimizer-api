const express = require('express');
const path = require('path');
const imageCompressor = require('./compress_engine');
const usefulFunctions = require('./useful_functions');
const multerConfig = require('./multer_config');

const router = express.Router();

// //////////////////////////////////////
// ////////   Backend Routes   //////////
// //////////////////////////////////////

router.post('/upload', multerConfig.fileValidator, async (req, res) => {
  /* istanbul ignore if  */
  if (process.env.DEBUG === 'true') {
    console.log(req.files);
  }
  const startTime = Date.now();
  const compressedFiles = [];
  await Promise.all(req.files.map(async (file) => {
    const imagePath = path.posix.join(file.destination, file.filename);
    const originalSize = usefulFunctions.getFileSizeInBytes(imagePath);
    const newImagePath = path.join('compressedPics/', req.compressID, '/', file.filename);
    const timeElapsed = await imageCompressor.compressJPEG(imagePath, path.posix.join('compressedPics/', req.compressID));
    if (!timeElapsed) {
      res.status(500).json({
        error: '500 - Internal Server Error',
      });
      return;
    }
    const newSize = usefulFunctions.getFileSizeInBytes(newImagePath);
    const percentReduction = 100 - ((newSize * 100) / originalSize);
    compressedFiles.push({
      timeElapsed,
      originalSize,
      newSize,
      percentReduction,
      downloadLink: `/download?compressID=${req.compressID}&fileName=${file.filename}`,
    });
  }));
  usefulFunctions.makeZip(req.compressID);
  res.status(200).json({
    totalTimeElapsed: Date.now() - startTime,
    compressedImages: compressedFiles,
    zipDownloadLink: `/download?compressID=${req.compressID}`,
    timestamp: new Date(),
  });
});

router.get('/download', (req, res) => {
  if (!req.query.compressID) {
    res.status(400).json({
      error: '400 - Wrong Query Params',
    });
  }
  if (req.query.fileName) {
    res.download(path.join('compressedPics/', req.query.compressID, '/', req.query.fileName));
  } else {
    res.download(path.posix.join('compressedPics/', `${req.query.compressID}.zip`));
  }
});

router.use((req, res) => {
  res.status(404).json({
    error: '404 Path not Found',
  });
});

module.exports = router;
