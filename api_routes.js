const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const imageCompressor = require("./compress_engine");
const fs = require("fs");



const maxFileSize = process.env.MAX_FILE_SIZE * 1024 * 1024


function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename)
    var fileSizeInBytes = stats["size"]
    return fileSizeInBytes
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}



////////////////////////////////////////
//////////   Multer Config    //////////
////////////////////////////////////////
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        folderName = makeid(10);
        folderPath = path.posix.join("uploads/", folderName, "/");
        fs.mkdirSync(folderPath);
        req.compressID = folderName;
        cb(null, folderPath);
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
    limits: {
        fileSize: maxFileSize
    },
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== "image/png" && file.mimetype !== "image/jpeg") {
            req.fileValidationError = 'MIME Type Error';
            return cb(null, false, new Error('MIME Type Error'));
        }
        cb(null, true);
    }
}).single("fileUpload");

////////////////////////////////////////
//////////   Backend Routes   //////////
////////////////////////////////////////

router.post("/upload", async (req, res) => {
    uploadSingle(req, res, async (err) => {
        if (req.fileValidationError) {
            res.status(400).send({
                error: "Error 400 Wrong File Format"
            });
            return;
        };
        if (err) {
            if (process.env.NODE_ENV === "development") {
                console.log(err);
            }
            res.status(400).json({
                error: "Error 400 Wrong File Syntax or Size"
            });
            return;
        };
        if (!req.file) {
            res.status(400).json({
                error: "Error 400 No file"
            });
            return;
        }
        if (req.file.mimetype === "image/jpeg" || req.file.mimetype === "image/png") {
            if(process.env.NODE_ENV === "development") {
                console.log(req.file);
            }
            let imagePath = path.posix.join(req.file.destination, req.file.filename);
            let originalSize = getFilesizeInBytes(imagePath);
            let newImagePath = path.join("compressedPics/", req.compressID, "/", req.file.filename);
            let timeElapsed = await imageCompressor.compressJPEG(imagePath, path.posix.join("compressedPics/", req.compressID));
            if (!timeElapsed) {
                res.status(500).json({
                    error: "500 - Internal Server Error"
                });
                return
            }
            let newSize = getFilesizeInBytes(newImagePath);
            let percentReduction = 100 - ((newSize * 100) / originalSize);
            res.status(200).json({
                timeElapsed: timeElapsed,
                originalSize: originalSize,
                newSize: newSize,
                reduction: percentReduction,
                downloadLink: "/download?compressID=" + req.compressID + "&fileName=" + req.file.filename,
                timestamp: new Date()
            });
        }
    })
});

router.get("/download", (req, res) => {
    res.download(path.join("compressedPics/", req.query.compressID, "/", req.query.fileName));
})

router.use((req, res, next) => {
    res.status(404).json({
        error: "404 Path not Found"
    });
});

module.exports = router;