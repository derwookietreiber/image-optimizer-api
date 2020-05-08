const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const imageCompressor = require("./compress_engine");
const fs = require("fs");



const maxFileSize = 15 * 1024 * 1024 //15MB

function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename)
    var fileSizeInBytes = stats["size"]
    return fileSizeInBytes
}



////////////////////////////////////////
//////////   Multer Config    //////////
////////////////////////////////////////
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        if (file.mimetype === "image/jpeg") {
            cb(null, Date.now() + '.jpg') //Appending .jpg
        } else if (file.mimetype === "image/png") {
            cb(null, Date.now() + '.png')
        }
    }
})


var uploadSingle = multer({
    limits: {fileSize: maxFileSize},
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== "image/png" && file.mimetype !== "image/jpeg") {
            req.fileValidationError = 'goes wrong on the mimetype';
            return cb(null, false, new Error('goes wrong on the mimetype'));
        }
        cb(null, true);
      }
}).single("fileUpload");

////////////////////////////////////////
//////////   Backend Routes   //////////
////////////////////////////////////////

router.post("/upload", async (req, res) => {
    uploadSingle(req, res, async (err) => {
        if(req.fileValidationError){
            res.status(400).send({error: "Error 400 Wrong File Format"});
            return;
        };
        if(err){
            res.status(400).json({error: "Error 400 Wrong File Syntax or Size"});
            return;
        };
        if(!req.file){
            res.status(400).json({error: "Error 400 No file"});
            return;
        }
        if (req.file.mimetype === "image/jpeg" || req.file.mimetype === "image/png") {
            let imagePath = path.posix.join("uploads/", req.file.filename);
            let originalSize = getFilesizeInBytes(imagePath);
            let timeElapsed = await imageCompressor.compressJPEG(imagePath);
            if(!timeElapsed){
                res.status(500).json({error: "500 - Internal Server Error"});
                return
            }
            let newImagePath = path.join("compressedPics/", req.file.filename);
            let newSize = getFilesizeInBytes(newImagePath);
            let percentReduction = 100 - ((newSize * 100) / originalSize);
            res.status(200).json({timeElapsed: timeElapsed, originalSize: originalSize, newSize: newSize, reduction: percentReduction, downloadLink: "/download?downloadID=" + req.file.filename, timestamp: new Date()});
        }
    })
});

router.get("/download", (req, res) => {
    downloadID = req.query.downloadID;
    res.download(path.join("compressedPics/", downloadID));
})

router.use((req, res, next) => {
    res.status(404).json({error: "404 Path not Found"});
});

module.exports = router;