const mongoose = require('mongoose');
const Playlist = require('../model/playlist.model');
const Video = require('../model/video.model');

const createPlaylist = async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist
  if ([name, description].some((field) => field?.trim() === '')) {
    res.status(400).json({
      error: 'Name and Description field is required..',
    });
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user?._id,
  });

  if (!playlist) {
    res.status(500).json({
      error: 'failed to create playlist',
    });
  }

  res.status(200).json({
    playlist,
    msg: 'Playlist created successfully',
  });
};

const getUserPlaylists = async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!mongoose.isValidObjectId(userId)) {
    res.status(400).json({
      error: 'Invalid userId',
    });
  }

  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'videos',
        foreignField: '_id',
        as: 'videos',
      },
    },
    {
      $addFields: {
        totalVideos: {
          $size: '$videos',
        },
        totalViews: {
          $sum: '$videos.views',
        },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        totalVideos: 1,
        totalViews: 1,
        updatedAt: 1,
      },
    },
  ]);
  return res.status(200).json({
    playlists,
    msg: 'User playlists fetched successfully',
  });
};

const getPlaylistById = async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!mongoose.isValidObjectId(playlistId)) {
    res.status(400).json({
      error: 'Invalid playlistId',
    });
  }
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    res.status(400).json({
      error: 'playlist not found',
    });
  }

  const playlistVideos = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'videos',
        foreignField: '_id',
        as: 'videos',
      },
    },
    {
      $match: {
        'videos.isPublished': true,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'owner',
      },
    },
    {
      $addFields: {
        totalVideos: {
          $size: '$videos',
        },
        totalViews: {
          $sum: '$videos.views',
        },
        owner: {
          $first: '$owner',
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        totalVideos: 1,
        totalViews: 1,
        videos: {
          _id: 1,
          videoFile: 1,
          thumbnail: 1,
          title: 1,
          description: 1,
          duration: 1,
          createdAt: 1,
          views: 1,
        },
        owner: {
          username: 1,
          fullname: 1,
          Avatar: 1,
        },
      },
    },
  ]);

  return res.status(200).json({
    playlistVideos,
    msg: 'playlist fetched successfully',
  });
};

const addVideoToPlaylist = async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (
    !mongoose.isValidObjectId(playlistId) ||
    !mongoose.isValidObjectId(videoId)
  ) {
    res.status(400).json({
      error: 'Invalid playlistId or videoId',
    });
  }

  const playlist = await Playlist.findById(playlistId);
  const video = await Video.findById(videoId);

  if (!playlist) {
    res.status(400).json({
      error: 'playlist not found',
    });
  }
  if (!video) {
    res.status(400).json({
      error: 'video not found',
    });
  }

  if (playlist?.owner?.toString() !== req.user?._id.toString()) {
    res.status(400).json({
      msg: 'only owner can add video to their playlist',
    });
  }
  const updatedPlaylist = await Playlist.findOneAndUpdate(
    new mongoose.Types.ObjectId(playlistId),
    { $addToSet: { videos: videoId } },
    { new: true }
  );

  if (!updatedPlaylist) {
    res.status(500).json({
      error: 'field to add video to playlist please try again',
    });
  }

  return res.status(200).json({
    updatePlaylist,
    msg: 'Added video to playlist successfully',
  });
};

const removeVideoFromPlaylist = async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (
    !mongoose.isValidObjectId(playlistId) ||
    !mongoose.isValidObjectId(videoId)
  ) {
    res.status(400).json({
      error: 'Invalid playlistId or videoId',
    });
  }

  const playlist = await Playlist.findById(playlistId);
  const video = await Video.findById(videoId);

  if (!playlist) {
    res.status(400).json({
      error: 'playlist not found',
    });
  }
  if (!video) {
    res.status(400).json({
      error: 'video not found',
    });
  }

  if (
    (playlist.owner?.toString() && video.owner.toString()) !==
    req.user?._id.toString()
  ) {
    res.status(400).json({
      msg: 'only owner can add video to their playlist',
    });
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    new mongoose.Types.ObjectId(playlistId),
    {
      $pull: {
        videos: videoId,
      },
    },
    { new: true }
  );

  return res.status(200).json({
    updatedPlaylist,
    msg: 'video removed from the playlist successfully...',
  });
};

const deletePlaylist = async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!mongoose.isValidObjectId(playlistId)) {
    res.status(400).json({
      error: 'Invalid playlistId',
    });
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    res.status(400).json({
      error: 'playlist not found',
    });
  }
  if (playlist.owner.toString() !== req.user?._id.toString()) {
    res.status(400).json({
      error: 'only owner can delete the playlist',
    });
  }

  await Playlist.findByIdAndDelete(playlistId);
  return res.status(200).json({
    msg: 'playlist deleted successfully',
  });
};

const updatePlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!mongoose.isValidObjectId(playlistId)) {
    res.status(400).json({
      error: 'Invalid playlistId',
    });
  }
  if (!name || !description) {
    res.status(400).json({
      msg: 'name and description both are required...',
    });
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    res.status(400).json({
      error: 'playlist not found',
    });
  }

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    res.status(400).json({
      error: 'only owner can edit the playlist',
    });
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    {
      new: true,
    }
  );
  return res.status(200).json({
    updatedPlaylist,
    msg: 'playlist updated successfully',
  });
};

module.exports = {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
