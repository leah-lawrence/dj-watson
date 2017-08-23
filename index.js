'use strict';

//////////////////////////////
// Requires
//////////////////////////////
const express = require('express');

const path = require('path');

const appEnv = require('./lib/env');
const renderer = require('./lib/render');
const cards = require('./db.json');
const watsonApi = require('./watsonApi.js');

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

app.get('/db', (req, res) => {
  res.status('200').json(cards);
});

app.get('/getWatsonData', (req, res) => {
  watsonApi.getWatsonData((data) => {
    res.status(200).json(data);
  });
});

app.use('/api', require('./server/api'));

//////////////////////////////
// Start the server
//////////////////////////////
app.listen(appEnv.port, () => {
  // Mean to console.log out, so disabling
  console.log(`Server starting on ${appEnv.url}`); // eslint-disable-line no-console
});
