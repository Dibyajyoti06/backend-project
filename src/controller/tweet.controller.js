const mongoose = require('mongoose');
const User = require('../model/user.model.js');
const Tweet = require('../model/tweet.model.js');

const createTweet = async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!content) {
    res.status(400).json({
      msg: 'content is required!',
    });
  }
  const tweet = await Tweet.create({
    content,
    owner: req.user?._id,
  });
  if (!tweet) {
    res.status(500).json({
      msg: 'failed to create tweet please try again!',
    });
  }
  return res.status(200).json({
    content,
    msg: 'Tweet created successfully',
  });
};

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { content } = req.body;
  const { tweet_id } = req.params;

  if (!content) {
    res.status(400).json({
      msg: 'content is required',
    });
  }

  if (!isValidObjectId(tweetId)) {
    res.status(400).json({
      msg: 'Invalid tweetId',
    });
  }

  const tweet = Tweet.findById(tweet_id);
  if (!tweet) {
    res.status(404).json({
      msg: 'Tweet not found',
    });
  }

  if (tweet?.owner.toString() !== req.user?._id.toString()) {
    res.status(400).json({
      msg: 'only owner can edit their tweet',
    });
  }

  const newTweet = Tweet.findByIdAndUpdate(
    {
      tweet_id,
    },
    {
      $set: {
        content,
      },
    },
    { new: true }
  );
  if (!newTweet) {
    res.status(500).json({
      msg: 'Failed to edit tweet please try again',
    });
  }
  return res.status(200).json({
    newTweet,
    msg: 'Tweet updated successfully',
  });
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    res.status(400).json({
      msg: 'Invalid tweetId',
    });
  }

  const tweet = Tweet.findById(tweet_id);
  if (!tweet) {
    res.status(404).json({
      msg: 'Tweet not found',
    });
  }

  if (tweet?.owner.toString() !== req.user?._id.toString()) {
    res.status(400).json({
      msg: 'only owner can delete their tweet',
    });
  }

  await Tweet.findByIdAndDelete(tweet_id);

  return res.status(200).json({
    tweet_id,
    msg: 'tweet deleted successfully',
  });
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  if (!mongoose.isValidObjectId(userId)) {
    res.status(400).json({
      msg: 'Invalid userId',
    });
  }
  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'ownerDetails',
        pipeline: [
          {
            $project: {
              username: 1,
              Avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'tweet',
        as: 'likeDetails',
        pipeline: [
          {
            $project: {
              likedBy: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: '$likeDetails',
        },
        ownerDetails: {
          $first: '$ownerDetails',
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, '$likeDetails.likedBy'] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        content: 1,
        ownerDetails: 1,
        likesCount: 1,
        createdAt: 1,
        isLiked: 1,
      },
    },
  ]);

  return res.status(200).json({
    tweets,
    msg: 'Tweets fetched successfully',
  });
});

module.exports = {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
};
