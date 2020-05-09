# Image Optimizer API ![Build](https://travis-ci.com/derwookietreiber/image-optimizer-api.svg?branch=master) ![Build](https://img.shields.io/david/derwookietreiber/image-optimizer-api)

Image Optimizer is a Node.js based API for Image Optimization. Right now it accepts the following formats:

* image/jpeg
* image/png

It is made with simplicity in mind, far from perfect but my personal attempt to resolve my problem as Web-Dev with far too large images. The image compression algorithms are _pngquant_ and _mozjpeg_.

The API accepts images in a multipart/form-data POST request to /upload and returns a json object with download link and other useful things. Right now it still is WIP so keep that in mind.

## License
Unlicense


