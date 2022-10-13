const User = require("../models/userModel");
const { promisify } = require('util')
const asyncHandler = require("express-async-handler");
const generateToken = require("../config/generateToken");
const jwt = require('jsonwebtoken');
const AppError = require("../utils/appError");


exports.registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, spaceUsed, spaceLimit, createdAt } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    return next(new AppError("Please Enter all the Fields", 401));
  }

  const userExist = await User.findOne({ email });

  if (userExist) {
    res.status(400);
    return next(new AppError("User already exists!", 401));
  }

  const user = await User.create({ name, email, password, role, phone, spaceUsed, spaceLimit, createdAt });

  if (user) {
    res.status(200).json({
      type: "success",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        spaceUsed: user.spaceUsed,
        spaceLimit: user.spaceLimit,
        createdAt: user.createdAt,
        token: generateToken(user._id),
      },
    });
  } else {
    res.status(400);
    return next(new AppError("Failed to create user!", 401));
  }
});

exports.authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(password);

  const user = await User.findOne({ email });
  console.log("user", user);
  console.log("pass", await user.matchPassword(password));

  if (user && (await user.matchPassword(password))) {
    res.status(200).json({
      type: 'success',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      }
    });
  } else {
    res.status(400);
    return next(new AppError("Email or password is incorrect!", 401));
  }
});

//

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("User does not have permission!"));
    }

    next();
  };
};


exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError("Not logged in", 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("User does not exists!", 401));

  }



  req.user = currentUser;
  next();
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('User with this ID does not exists!', 401))
  }

  res.status(202).json({
    message: 'success',
    data: null
  })
})

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body);

  if (!user) {
    return next(new AppError('User with this ID does not exists!', 401))
  }

  res.status(202).json({
    message: 'success',
    data: req.body
  })
})

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User with this ID does not exists!', 400))
  }

  res.status(200).json({ message: 'success', data: user })
})


exports.getAllUser = asyncHandler(async (req, res, next) => {
  const users = await User.find();

  if (!users) {
    return next(new AppError("Can't find any users"));
  }

  res.status(200).json({ message: 'success', data: users })
})

exports.searchUsers = asyncHandler(async (req, res, next) => {

  const users = await User.find();
  let filtered = users.filter(el => el.name.toLowerCase().includes(req.params.key.toLocaleLowerCase()));

  if (!users) {
    return next(new AppError("Can't find any users"));
  }

  res.status(200).json({ message: 'success', data: filtered })
})

