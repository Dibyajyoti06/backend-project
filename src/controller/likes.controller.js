const { default: mongoose } = require('mongoose');
const Like = require('../model/like.model');

const toggleVideoLike = async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video

  if (!mongoose.isValidObjectId(videoId)) {
    res.status(400).json({
      msg: 'Invalid videoId',
    });
  }

  const likedAlready = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (likedAlready) {
    await Like.findByIdAndDelete(likedAlready?._id);

    return res.status(200).json({
      isLiked: false,
    });
  }

  await Like.create({
    video: videoId,
    likedBy: req.usere?._id,
  });
  return res.status(200).json({
    isLiked: true,
  });
};

const toggleCommentLike = async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  if (!mongoose.isValidObjectId(commentId)) {
    res.status(400).json({
      msg: 'Invalid commentId',
    });
  }

  const likedAlready = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (likedAlready) {
    await Like.findByIdAndDelete(likedAlready?._id);

    return res.status(200).json({
      isLiked: false,
    });
  }

  await Like.create({
    comment: commentId,
    likedBy: req.usere?._id,
  });
  return res.status(200).json({
    isLiked: true,
  });
};

const toggleTweetLike = async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  if (!mongoose.isValidObjectId(tweetId)) {
    res.status(400).json({
      msg: 'Invalid videoId',
    });
  }

  const likedAlready = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  if (likedAlready) {
    await Like.findByIdAndDelete(likedAlready?._id);

    return res.status(200).json({
      isLiked: false,
    });
  }

  await Like.create({
    tweet: tweetId,
    likedBy: req.usere?._id,
  });
  return res.status(200).json({
    isLiked: true,
  });
};

const getLikedVideos = async (req, res) => {
  //TODO: get all liked videos
  const likedVideosAggregate = await Like.aggregate([
    {
      $match: {
        likedBy: req.user?._id,
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'video',
        foreignField: '_id',
        as: 'likedVideo',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              foreignField: '_id',
              as: 'ownerDetails',
            },
          },
          {
            $unwind: '$ownerDetails',
          },
        ],
      },
    },
    {
      $unwind: '$likedVideo',
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        _id: 0,
        likedVideo: {
          _id: 1,
          videoFile: 1,
          thumbnail: 1,
          owner: 1,
          title: 1,
          description: 1,
          views: 1,
          duration: 1,
          createdAt: 1,
          isPublished: 1,
          ownerDetails: {
            username: 1,
            fullName: 1,
            avatar: 1,
          },
        },
      },
    },
  ]);

  return res.status(200).json({
    likedVideosAggregate,
    msg: 'liked videos fetched successfully!...',
  });
};

module.exports = {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
};
