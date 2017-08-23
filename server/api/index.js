'use strict';

console.log('I AM IN CONTROLLER');

const express = require('express');
const router = express.Router();

const controller = require('./controller');

router.get('/get', controller.getData);

module.exports = router;
