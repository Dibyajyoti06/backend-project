const { Router } = require('express');
const {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} = require('../controller/tweet.controller.js');
const { verifyJWT } = require('../middleware/auth.middleware.js');

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route('/').post(createTweet);
router.route('/user/:userId').get(getUserTweets);
router.route('/:tweetId').patch(updateTweet).delete(deleteTweet);

module.exports = router;
