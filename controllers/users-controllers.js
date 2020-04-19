const uuid = require('uuid/v4');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');

const User = require('../models/user');

// const DUMMY_USERS = [
//   {
//     id: "u1",
//     name: "Thang Tran",
//     email: "phucthang1101@gmail.com",
//     password: "test"
//   }
// ];

const getUsers = async (req, res, next) => {
  //DUMMY_USER version:
  // res.json({
  //   users: DUMMY_USERS
  // });

  //MongoDB version:
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError(
      'Fetching users failed, please try again later',
      500
    );
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //not allow using throw in async function
    //have to use next(error)

    const err = new HttpError(
      'Invalid inputs passed, please check your data',
      422
    );
    return next(err);
  }

  const { name, email, password } = req.body;

  //DUMMY_USER version:
  // const hasUser = DUMMY_USERS.find(u => u.email === email);
  // if (hasUser) {
  //   //422 use for invalid user input
  //   throw new HttpError("Could not create user,email already exits.", 422);
  // }
  // const createdUser = {
  //   id: uuid(),
  //   name,
  //   email,
  //   password
  // };
  ///DUMMY_USERS.push(createdUser);

  //MongoDB version:
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later',
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'User exsts already, please try another email',
      422
    );
    return next(error);
  }

  // crypt password
  // when we use HTTPS
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError('Could not create user, please try again', 500);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError('Signing up failed, please try again', 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: createdUser.id,
        email: createdUser.email,
      },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError('Signing up failed, please try again', 500);
    return next(error);
  }
 
  res
  .status(201)
  .json({ userId: createdUser.id, email:createdUser.email, token:token });
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data', 422);
  }

  const { email, password } = req.body;

  //DUMMY_USER version:
  // const identifiedUser = DUMMY_USERS.find(u => u.email === email);
  // if (!identifiedUser || identifiedUser.password !== password) {
  //   throw new HttpError(
  //     "Could not identify user, credentials seem to be wrong.",
  //     401
  //   );
  // }

  //MongoDB version:
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Logging up failed, please try again later',
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, could not log you in',
      401
    );
    return next(error);
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      'Could not log you in, please check your password and try again',
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'Could not log you in, please check your password and try again',
      500
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
      },
      'supersecret_dont_share',
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError('Loggin in failed, please try again', 500);
    return next(error);
  }


  res.json({
   
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
