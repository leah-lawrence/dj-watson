'use strict';

const service = require('./service');

const getLyrics = (req, res) => {
  return service.getLyrics()
    .then(response => {
      res.status(200).json(response);
    })
    .catch(() => {
      res.status(500).json({
        reason: 'Server Error',
      });
    });
};

const postLyricsToWatson = (req, res) => {
  return service.postLyricsToWatson()
    .then(response => {
      res.status(200).json(response);
    })
    .catch(() => {
      res.status(500).json({
        reason: 'Server Error',
      });
    });
};

const getSpotifyAccessCode = (req, res) => {
  return service.getSpotifyAccessCode()
    .then(response => {
      res.status(200).json(response);
    })
    .catch(() => {
      res.status(500).json({
        reason: 'Server Error',
      });
    });
};


module.exports = {
  getLyrics,
  postLyricsToWatson,
  getSpotifyAccessCode,
};
