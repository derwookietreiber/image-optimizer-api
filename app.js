const express = require("express");
const dotenv = require('dotenv');
const backendRoutes = require("./api_routes");

dotenv.config();


var app = express();

app.use(backendRoutes); 
const server = app.listen(process.env.PORT, () => {
    console.log("Server Started on Port:", server.address().port);
});


module.exports = app;