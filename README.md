# Image Optimizer API [![Build Status](https://travis-ci.com/wokiex/image-optimizer-api.svg?branch=master)](https://travis-ci.com/wokiex/image-optimizer-api) ![Build](https://img.shields.io/david/wokiex/image-optimizer-api)

Image Optimizer is a Node.js based API for Image Optimization. Right now it accepts the following formats:

* image/jpeg
* image/png

It is made with simplicity in mind, far from perfect but my personal attempt to resolve my problem as Web-Dev with far too large images. The image compression algorithms are _pngquant_ and _mozjpeg_.

The API accepts images in a multipart/form-data POST request to /upload and returns a json object with download link and other useful things. Right now it still is WIP so keep that in mind.

## Installation
The installation process is pretty straight forward. Just install the dependencies with:
```javascript
npm install
```
And then create a .env file at the root of the folder with your desired params
```
PORT = 1337
NODE_ENV = production 
DEBUG = false // This add some additional console.logs, etc.
DELETE_ON_START = true  // Clears all folders on start
MAX_FILE_SIZE = 15  // Max File size in Mb
MAX_FILES = 8
```
After this youre ready to roll just start the server with
```
node app.js
```
## API

### Request
The request API is also kept very simple. The server accepts POST requests on _/upload_ with the following criterias:
* _content-type_ header must be _multipart/form-data_.
* _body_ must contain a fileUpload field with the corresponding images to optimize.\

### Response
Keep in mind that the response of the server depends on load, cpu processing power and other resources, with large files and lots of the response can take up to 25s. It is also recommendable to make smaller request with data rather than one large one. \
The Server Response is in JSON and contains:

```json
{
    "totalTimeElapsed": 1229, // Time in Milliseconds
    "compressedImages": [ // Array of Compressed Images
        {
            "timeElapsed": 1185,
            "originalSize": 1258920, // Original Size in Bytes
            "newSize": 201529, // New Size in Bytes
            "percentReduction": 83.99191370380962, // Reduction in Percent
            "downloadLink": "/download?compressID=qc3FnrdkMY&fileName=1589823305384.jpg" //Download Link for this specific file
        }
    ],
    "zipDownloadLink": "/download?compressID=qc3FnrdkMY", // Download link for ZIP with all the files
    "zipMD5": "eab4bae2e65aa1b5fe7f81ee97c882a8", // MD5 Hash of the ZIP file
    "timestamp": "2020-05-18T17:35:06.625Z" // Timestamp
}
```

## Tests
All tests are written using _mocha_, _chai_ and _chai-http_. To test the software just use
```
npm test
```

## Dependencies
* Express Framework
* Multer
* Imagemin
  
## License
This Project is Licensed under the Unlicense, see the LICENSE file for details.

