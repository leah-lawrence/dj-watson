'use strict';

const express = require('express');
const router = new express.Router();
const watsonApi = require('./watsonApi.js');

const controller = require('./controller');

router.get('/getLyrics', controller.getLyrics);
router.get('/postLyricsToWatson', controller.postLyricsToWatson);

router.get('/getWatsonData', (req, res) => {
  watsonApi.getWatsonData((data) => {
    res.status(200).json(data);
  });
});

module.exports = router;
