const { default: mongoose } = require('mongoose');
const User = require('../model/user.model');
const { uploadonCloudinary } = require('../utils/cloudinary');
const jwt = require('jsonwebtoken');

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    //Generate Access and Refresh Token
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

const registerUser = async (req, res) => {
  // get user details from frontend
  const { username, fullname, email, password } = req.body;

  // validation - not empty
  if (
    [fullname, email, username, password].some((field) => field?.trim() === '')
  ) {
    res.status(400).json({ error: 'all fields are required' });
  }

  // check if user already exists:username or email
  const existUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existUser) {
    res
      .status(409)
      .json({ error: 'User with email or username already exist!!' });
  }
  // check for images, check for avatar
  // console.log(req.files);
  const avatarLocalPath = req.files?.Avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  // Another way
  // let coverImageLocalPath;
  // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
  //   coverImageLocalPath=req.files.coverImage[0].path;
  // }

  if (!avatarLocalPath)
    res.status(400).json({ error: 'Avatar path is required' });
  // upload them to cloudinary, avatar
  const avatar = await uploadonCloudinary(avatarLocalPath);
  const coverImage = await uploadonCloudinary(coverImageLocalPath);
  if (!avatar) res.status(400).json({ error: 'Avatar file is required' });

  // create user object - create entry in db
  const user = await User.create({
    username: username.toLowerCase(),
    fullname,
    email,
    password,
    Avatar: avatar.url,
    coverImage: coverImage?.url || '',
  });
  // delete statements are removing the "password" and "refreshToken" fields from the user object before sending it as a response.
  delete user.password;
  delete user.refreshToken;

  // remove password and refresh token field from response
  // check for user creation
  if (!user)
    res.status(400).json({
      error: 'user not found!!',
    });
  // return res
  res.status(201).send(user);
};

async function userLogin(req, res) {
  //Get Data from frontend
  const { username, email, password } = req.body;
  //Find the user

  if (!username && !email) {
    return res.status(400).json({ error: 'username or email is required' });
  }

  const existUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!existUser) {
    return res.status(404).json({ error: "User doesn't Exist" });
  }

  //Password Check
  const checkpassword = await existUser.isPasswordCorrect(password);
  if (!checkpassword) {
    return res.status(401).json({ error: 'Invalid User Credentials' });
  }

  //generate access and refresh token...

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    existUser._id
  );
  //remove the password and refreshToken field before returning it.

  // const loggedInUser = await User.findById(user._id).select("-password -refreshToken");  //it took an extra query to the db

  const loggedInUser = existUser.toJSON({ virtuals: true });
  delete loggedInUser.password;
  delete loggedInUser.refreshToken;

  //Send through Cookies

  const options = {
    httpOnly: true, //modified by server only
    secure: true,
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json({
      user: loggedInUser,
      accessToken,
      refreshToken,
      msg: 'You are successfully LogedIn',
    });
}

async function logoutUser(req, res) {
  await User.findByIdAndUpdate(
    req.user_id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true, // return new response value
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json({ msg: 'User logged Out Successfully' });
}

async function RefreshAccessToken(req, res) {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    res.status(401).json({
      msg: 'Unauthorized Request...',
    });
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      res.status(401).json({
        msg: 'Invalid refresh Token',
      });
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      res.status(401).json({ msg: 'Refresh token is expired or used' });
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newRefreshToken, options)
      .json({
        accessToken,
        refreshToken: newRefreshToken,
        msg: 'Access token refreshed',
      });
  } catch (error) {
    res.status(401).json({
      msg: 'Invalid refresh Token',
    });
  }
}

async function changePassword(req, res) {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    res.status(400).json({
      msg: 'Invalid old password',
    });
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({
    msg: 'Password changed Successfully',
  });
}

async function getCurrentUser(req, res) {
  return res.status(200).json({
    user: req.user,
    msg: 'current user fetched Successfully',
  });
}

async function updateAccountDetails(req, res) {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    res.status(400).json({
      msg: 'All fields are required',
    });
  }
  const user = await User.findById(
    req.user._id,
    {
      $set: {
        fullname,
        email,
      },
    },
    { new: true }
  ).select('-password');
  return res.status(200).json({
    msg: 'Account details update successfully..',
  });
}

async function updateUserAvatar(req, res) {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    res.status(400).json({
      msg: 'Avatar file is missing',
    });
  }
  const avatar = await uploadonCloudinary(avatarLocalPath);
  if (!avatar.url) {
    res.status(400).json({
      msg: 'Error while uploading on avatar',
    });
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        Avatar: avatar.url,
      },
    },
    { new: true }
  ).select('-password');
  res.status(200).json({
    user,
    msg: 'Avatar Image updated Successfully',
  });
  //After that we delete previous Avatar...
  //Code.....
}

async function updateUserCoverImage(req, res) {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    res.status(400).json({
      msg: 'coverImage file is missing',
    });
  }
  const coverImage = await uploadonCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    res.status(400).json({
      msg: 'Error while uploading on coverImage',
    });
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select('-password');

  res.status(200).json({
    user,
    msg: 'coverImage updated Successfully',
  });
  //After that we delete previous coverImage...
  //Code.....
}

async function getWatchHistory(req, res) {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'watchHistory',
        foreignField: '_id',
        as: 'watchHistory',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              foreignField: '_id',
              as: 'owner',
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: { $first: '$owner' },
            },
          },
        ],
      },
    },
  ]);

  return res.status(200).json({
    user: user[0].watchHistory,
    msg: 'Watch history fetched successfully',
  });
}

async function getUserChannelProfile(req, res) {
  const { username } = req.params;
  if (!username?.trim) {
    res.status(400).json({
      msg: 'username is missing',
    });
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'channel',
        as: 'subscribers',
      },
    },
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
        subscribersCount: {
          $size: '$subscrib ers',
        },
        channelSubscribedToCount: {
          $size: '$subscribedTo',
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, '$subscribers.subscriber'] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
  if (!channel?.length) {
    res.status(404).json({
      msg: 'channeld does not exists',
    });
  }
  return res.status(200).json({
    channel: channel[0],
    msg: 'User channel fetched successfully',
  });
}

module.exports = {
  userLogin,
  registerUser,
  logoutUser,
  RefreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getWatchHistory,
  getUserChannelProfile,
};
