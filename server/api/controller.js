'use strict';

const service = require('./service')

module.exports = {
  getLyrics: getLyrics,
  postLyricsToWatson: postLyricsToWatson
};

function getLyrics(req, res) {
  return service.getLyrics()
    .then(response => {
      res.status(200).json(response);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({reason: 'Server Error'});
    });
}

function postLyricsToWatson(req, res) {
  return service.postLyricsToWatson()
    .then(response => {
      res.status(200).json(response);
    })
    .catch(() => {
      res.status(500).json({reason: 'Server Error'});
    });
}
