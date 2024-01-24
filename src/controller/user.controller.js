const User = require('../model/user.model');

const registerUser = async (req, res) => {
  // get user details from frontend
  const body = req.body;
  // validation - not empty
  // check if user already exists:username or email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res
  res.status(201).json({
    status: 'success',
  });
  console.log(body);
};

function userLogin(req, res) {
  res.json({
    msg: 'Hello from backend Project',
  });
}

module.exports = { userLogin, registerUser };
