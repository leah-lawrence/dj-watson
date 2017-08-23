'use strict';

const service = require('./service')

module.exports = {
  getData: getData
};

function getData(req, res) {
  res.status(200).json({name: 'Hello'});
}
