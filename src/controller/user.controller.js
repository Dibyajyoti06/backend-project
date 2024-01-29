const User = require('../model/user.model');
const { uploadonCloudinary } = require('../utils/cloudinary');

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    //Generate Access and Refresh Token
    const accessToken = existUser.generateAccessToken();
    const refreshToken = existUser.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    res.status(500).json({
      error: 'Something went wrong while generating refresh and access token',
    });
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

  // remove password and refresh token field from response
  // check for user creation
  if (!user)
    res.status(400).json({
      error: 'user not found!!',
    });
  // return res
  res.status(200).send(user);
};

async function userLogin(req, res) {
  //Get Data from frontend
  const { username, email, password } = req.body;
  //Find the user
  if (!username || !password) {
    res.status(400).json({ error: 'username or email is required' });
  }

  const existUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  //Password Check
  if (!existUser) {
    return res.status(404).json({ error: "User doesn't Exist" });
  }
  const checkpassword = await existUser.isPasswordCorrect(password);
  if (!checkpassword) {
    return res.status(401).json({ error: 'Invalid User Credentials' });
  }

  const { accessToken, refreshToken } = awaitgenerateAccessAndRefreshTokens(
    user._id
  );
  //Send through Cookies

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json({
      user: accessToken,
      refreshToken,
      msg: 'You are successfully LogedIn',
    });
}

module.exports = { userLogin, registerUser };
