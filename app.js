const express = require("express");
const backendRoutes = require("./api_routes");


var app = express();
//app.use(express.static(__dirname + '/public'));

app.use(backendRoutes); 
const server = app.listen(3000, () => {
    console.log("Server Started on Port:", server.address().port);
});


module.exports = app;