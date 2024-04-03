const express = require('express');
const router = express.Router();

const {
  getChannelStats,
  getChannelVideos,
} = require('../controller/dashboard.controller');

const { verifyJWT } = require('../middleware/auth.middleware');

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route('/stats').get(getChannelStats);
router.route('/videos').get(getChannelVideos);

module.exports = router;
