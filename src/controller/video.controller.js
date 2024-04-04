const mongoose = require('mongoose');
const Video = require('../model/video.model.js');
const Like = require('../model/like.model.js');
const Comment = require('../model/comment.controller.js');
const User = require('../model/user.model.js');
const { uploadonCloudinary } = require('../utils/cloudinary.js');

const getAllVideos = async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  let pipeline = [];

  if (query) {
    pipeline.push({
      $search: {
        $index: 'search-video',
        $text: {
          query: query,
          path: ['title', 'description'],
        },
      },
    });
  }

  if (!mongoose.isValidObjectId(userId)) {
    res.status(400).json({
      msg: 'Invalid userId',
    });
  }

  pipeline.push({
    $match: {
      owner: new mongoose.Types.ObjectId(userId),
    },
  });
  if (sortBy && sortType) {
    pipeline.push({
      $sort: {
        [sortBy]: sortType === 'asc' ? 1 : -1,
      },
    });
  } else {
    pipeline.push({
      $sort: { createdAt: -1 },
    });
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };
  const videoAggregate = await Video.aggregate(pipeline);

  const video = await Video.aggregatePaginate(videoAggregate, options);

  return res.status(200).json({
    video,
    msg: 'Videos fetched successfully',
  });
};

const publishAVideo = async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if ([title, description].some((field) => field?.trim() === '')) {
    res.status(400).json({
      msg: 'All fields are required',
    });
  }
  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoFileLocalPath) {
    res.status(400).json({
      msg: 'videoFileLocalPath is required',
    });
  }

  if (!thumbnailLocalPath) {
    res.status(400).json({
      msg: 'thumbnailLocalPath is required',
    });
  }

  const videoFile = await uploadonCloudinary(videoFileLocalPath);
  const thumbnail = await uploadonCloudinary(thumbnailLocalPath);

  if (!videoFile) {
    res.status(400).json({ msg: 'Video file not found' });
  }
  if (!thumbnail) {
    res.status(400).json({ msg: 'Thumbnail file not found' });
  }

  const video = await Video.create({
    title,
    description,
    duration: videoFile.duration,
    videofile: videoFile.url,
    thumbnail: thumbnail.url,
    owner: req.user?._id,
    isPublished: false,
  });
  if (!video) {
    res.status(400).json({
      msg: 'videoUpload failed please try again ',
    });
  }
  return res.status(200).json({
    video,
    msg: 'Video uploaded successfully',
  });
};

const getVideoById = async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if (!mongoose.isValidObjectId(videoId)) {
    res.status(400).json({
      msg: 'Invalid videoId',
    });
  }

  const video = Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'video',
        as: 'likes',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'owner',
        pipeline: [
          {
            $lookup: {
              from: 'subscriptions',
              localField: '_id',
              foreignField: 'channel',
              as: 'subscribers',
            },
          },
          {
            $addFields: {
              subscribersCount: {
                $size: '$subscribers',
              },
              isSubscribed: {
                $cond: {
                  if: {
                    $in: [req.user?._id, '$subscribers.subscriber'],
                  },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $project: {
              username: 1,
              avatar: 1,
              subscribersCount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: '$likes',
        },
        owner: {
          $first: '$owner',
        },
        isLiked: {
          $cond: {
            if: {
              $in: [req.user?._id, '$likes.likedBy'],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        videoFile: 1,
        title: 1,
        description: 1,
        views: 1,
        createdAt: 1,
        isPublished: 1,
        duration: 1,
        comments: 1,
        owner: 1,
        likesCount: 1,
        isLiked: 1,
      },
    },
  ]);
};

const updateVideo = async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  if (!mongoose.isValidObjectId(videoId)) {
    res.status(400).json({
      msg: 'Invalid videoId',
    });
  }

  if (!(title && description)) {
    res.status(400).json({
      msg: 'title and description are required',
    });
  }

  if (!thumbnailLocalPath) {
    res.status(400).json({
      msg: 'thumbnailfile not found',
    });
  }

  const thumbnail = await uploadonCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    res.status(400).json({
      msg: 'thumbnail not found',
    });
  }

  const video = await Video.findById(videoId);

  if (video?.owner.toString() !== req.user?._id.toString()) {
    res.status(400).json({
      msg: "You can't edit this video as you are not the owner",
    });
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: thumbnail.url,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedVideo) {
    res.status(500).json({
      msg: 'Failed to update video please try again',
    });
  }

  return res.status(200).json({
    updatedVideo,
    msg: 'Video updated successfully',
  });
};

const deleteVideo = async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!mongoose.isValidObjectId(videoId)) {
    res.status(400).json({
      msg: 'Invalid videoId',
    });
  }

  const video = await Video.findById(videoId);

  if (!video) {
    res.status(404).json({
      msg: 'Video not found',
    });
  }

  if (video?.owner.toString() !== req.user?._id.toString()) {
    res.status(400).json({
      msg: "You can't delete this video as you are not the owner",
    });
  }

  const videoDeleted = await Video.findByIdAndDelete(video?._id);

  if (!videoDeleted) {
    res.status(400).json({
      msg: 'Failed to delete the video please try again',
    });
  }

  // delete video likes
  await Like.deleteMany({
    video: videoId,
  });

  // delete video comments
  await Comment.deleteMany({
    video: videoId,
  });

  return res.status(200).json({ msg: 'Video deleted successfully' });
};

const togglePublishStatus = async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.isValidObjectId(videoId)) {
    res.status(400).json({
      msg: 'Invalid videoId',
    });
  }

  const video = await Video.findById(videoId);

  if (!video) {
    res.status(400).json({
      msg: 'Video not found',
    });
  }

  if (video?.owner.toString() !== req.user?._id.toString()) {
    res.status(400).json({
      msg: "You can't edit this video as you are not the owner",
    });
  }

  const toggledVideoPublish = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video?.isPublished,
      },
    },
    { new: true }
  );

  if (!toggledVideoPublish) {
    res.status(500).json({
      msg: 'Failed to toggle video publish status',
    });
  }

  return res.status(200).json({
    isPublished: toggledVideoPublish.isPublished,
    msg: 'publish toggled successfully',
  });
};

module.exports = {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
