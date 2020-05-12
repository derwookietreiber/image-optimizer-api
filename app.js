const dotenv = require('dotenv'); // Set Up Env. Variables before everything else

dotenv.config();


const express = require('express');
const backendRoutes = require('./api_routes');
const folderManager = require('./folder_manager');

// Check folders
folderManager.checkFolders();
// Clean Folders
folderManager.clearFolders();


const app = express();

app.use(backendRoutes);
const server = app.listen(process.env.PORT, () => {
  /* istanbul ignore if  */
  if (process.env.NODE_ENV !== 'test') {
    console.log('Server Started on Port:', server.address().port);
  }
});


module.exports = app;
