const express = require('express');

const {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} = require('../controller/subscription.controller');

const { verifyJWT } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route('/c/:channelId')
  .get(getUserChannelSubscribers)
  .post(toggleSubscription);
router.route('/u/:subscriberId').get(getSubscribedChannels);

module.exports = router;
