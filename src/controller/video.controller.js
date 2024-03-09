const mongoose = require('mongoose');
const Video = require('../model/video.model.js');
const Like = require('../model/like.model.js');
const Comment = require('../model/comment.controller.js');
const User = require('../model/user.model.js');
const {
  uploadOnCloudinary,
  deleteonCloudinary,
} = require('../utils/cloudinary.js');

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if ([title, description].some((field) => field?.trim() === '')) {
    res.status(400).json({
      msg: 'All fields are required',
    });
  }

  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.file?.thumbnail[0]?.path;
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

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

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
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.thumbnail[0]?.path;

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

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
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
});

const deleteVideo = asyncHandler(async (req, res) => {
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
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

module.exports = {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
