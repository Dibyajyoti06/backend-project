const express = require('express');
const {
  getLikedVideos,
  toggleCommentLike,
  toggleVideoLike,
  toggleTweetLike,
} = require('../controller/likes.controller.js');
const { verifyJWT } = require('../middleware/auth.middleware.js');

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route('/toggle/v/:videoId').post(toggleVideoLike);
router.route('/toggle/c/:commentId').post(toggleCommentLike);
router.route('/toggle/t/:tweetId').post(toggleTweetLike);
router.route('/videos').get(getLikedVideos);

module.exports = router;
