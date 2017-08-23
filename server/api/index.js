'use strict';

const express = require('express');
const router = express.Router();
const watsonApi = require('./watsonApi.js');
const cards = require('./db.json');

const controller = require('./controller');

router.get('/getLyrics', controller.getLyrics);
router.get('/postLyricsToWatson', controller.postLyricsToWatson);

router.get('/db', (req, res) => {
  res.status('200').json(cards);
});

router.get('/getWatsonData', (req, res) => {
  watsonApi.getWatsonData((data) => {
    res.status(200).json(data);
  });
});

module.exports = router;
