'use strict';

const service = require('./service')

module.exports = {
  getLyrics: getLyrics
};

function getLyrics(req, res) {
  return service.getLyrics()
    .then(response => {
      res.status(200).json(response);
    })
    .catch(() => {
      res.status(500).json({reason: 'Server Error'});
    });
}
