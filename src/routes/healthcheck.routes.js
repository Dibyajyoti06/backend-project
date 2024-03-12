const express = require('express');
const router = Router();

const healthcheck = require('../controller/healthcheck.controller');

router.route('/').get(healthcheck);

module.exports = router;
