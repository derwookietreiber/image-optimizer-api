const dotenv = require('dotenv');  //Set Up Env. Variables before everything else
dotenv.config();

const express = require("express");
const del = require("del");
const backendRoutes = require("./api_routes");
const fs = require("fs");

fs.access("compressedPics", fs.constants.F_OK, (err) => {
    if (err && err.code === 'ENOENT') {
        fs.mkdir("compressedPics/", (err) => {
            console.log("ERROR: Failed to create compressedPics Folder");
        });
    }
});
fs.access("uploads",fs.constants.F_OK, (err) => {
    if (err && err.code === 'ENOENT') {
        fs.mkdir("uploads/", (err) => {
            console.log("ERROR: Failed to create compressedPics Folder");
        });
    }
});

if(process.env.DELETE_ON_START){
    (async () => {
        const deletedPaths = await del(['compressedPics/*', 'uploads/*']);
    })()
}


var app = express();

app.use(backendRoutes);
const server = app.listen(process.env.PORT, () => {
    if (process.env.NODE_ENV !== "test") {
        console.log("Server Started on Port:", server.address().port);
    }
});


module.exports = app;