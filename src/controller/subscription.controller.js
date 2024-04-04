const mongoose = require('mongoose');
const Subscription = require('../model/subscription.model');

const toggleSubscription = async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!mongoose.isValidObjectId(channelId)) {
    res.status(400).json({
      msg: 'Invalid channelId!',
    });
  }
  const isSubscribed = await Subscription.findOne({
    subscriber: req.user?._id,
    channel: channelId,
  });
  if (isSubscribed) {
    await Subscription.findByIdAndDelete(isSubscribed?._id);
    return res.status(200).json({
      subscribed: false,
      msg: 'unsubscribed successfully',
    });
  }

  await Subscription.create({
    subscriber: req.user?._id,
    channel: channelId,
  });
  res.status(200).json({
    subscribed: true,
    msg: 'subscribed successfully...',
  });
};

// controller to return subscriber list of a channel
const getUserChannelSubscribers = async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.isValidObjectId(channelId)) {
    res.status(400).json({
      msg: 'Invalid channelId!',
    });
  }

  const subscribersDetails = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'subscriber',
        foreignField: '_id',
        as: 'subscribers',
        pipeline: [
          {
            $lookup: {
              from: 'subscriptions',
              localField: '_id',
              foreignField: 'channel',
              as: 'subscribedTo',
            },
          },
          {
            $addFields: {
              subscribedTo:
                // '$subscribedTo.subscriber',
                {
                  $cond: {
                    if: {
                      $in: [
                        new mongoose.Types.ObjectId(channelId),
                        '$subscribedTo.subscriber',
                      ],
                    },
                    then: true,
                    else: false,
                  },
                },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: '$subscribers',
        },
      },
    },
    {
      $project: {
        _id: 1,
        subscribers: {
          _id: 1,
          username: 1,
          fullname: 1,
          Avatar: 1,
          subscribedTo: 1,
          subscribersCount: 1,
        },
      },
    },
  ]);

  return res.status(200).json({
    subscribersDetails,
    msg: 'Subscribers fetched successfully...',
  });
};

// controller to return channel list to which user has subscribed
const getSubscribedChannels = async (req, res) => {
  const { subscriberId } = req.params;

  const subscribedChannel = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'channel',
        foreignField: '_id',
        as: 'subscribedChannel',
        pipeline: [
          {
            $lookup: {
              from: 'videos',
              localField: '_id',
              foreignField: 'owner',
              as: 'videos',
            },
          },
          {
            $addFields: {
              latestVideo: {
                $last: '$videos',
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: 0,
        subscribedChannel: {
          _id: 1,
          username: 1,
          fullname: 1,
          Avatar: 1,
          latestVideo: {
            _id: 1,
            videofile: 1,
            thumbnail: 1,
            owner: 1,
            title: 1,
            description: 1,
            duration: 1,
            createdAt: 1,
            views: 1,
          },
        },
      },
    },
  ]);

  return res.status(200).json({
    subscribedChannel,
    msg: 'subscribed channel fetched successfully...',
  });
};

module.exports = {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
};
