const User = require('../model/user.model');

const registerUser = async (req, res) => {
  // get user details from frontend
  const { username, fullname, email, password, avatar, coverImage } = req.body;
  // validation - not empty
  if (!username) {
    res.status(400).json({
      msg: 'username is required',
    });
  }
  // check if user already exists:username or email
  User.findOne();
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res
};

function userLogin(req, res) {
  res.json({
    msg: 'Hello from backend Project',
  });
}

module.exports = { userLogin, registerUser };
