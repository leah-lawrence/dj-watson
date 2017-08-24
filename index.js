'use strict';

//////////////////////////////
// Requires
//////////////////////////////

const express = require('express');

const path = require('path');

const appEnv = require('./lib/env');
const renderer = require('./lib/render');

// Check if the application is running locally and use the environment variables accordingly
process.env = (appEnv.isLocal) ? require('./local.env.json') : process.env;

//////////////////////////////
// App Variables
//////////////////////////////

const app = express();

app.engine('html', renderer);
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.use('/api', require('./server/api'));

//////////////////////////////
// Start the server
//////////////////////////////

app.listen(appEnv.port, () => {
  // Mean to console.log out, so disabling
  console.log(`Server starting on ${appEnv.url}`); // eslint-disable-line no-console
});
