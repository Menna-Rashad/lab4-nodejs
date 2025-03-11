const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const util = require("util");

const jwtSign = util.promisify(jwt.sign);

const signup = async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm) {
    return res.status(400).json({ message: "Password and passwordConfirm are required" });
  }

  if (password !== passwordConfirm) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  res.status(201).json({ status: "success", data: { user: newUser } });
};

// Get all users
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.status(200).json({ status: "success", data: { users } });
  } catch (err) {
    next(err); 
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const token = await jwtSign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.status(200).json({ status: "success", data: { token } });
};


// Get a user by ID
const getUserById = async (req, res, next) => {
  try {
    // Find user by ID in MongoDB
    const user = await User.findById(req.params.id); 

    if (!user) {
      // If user is not found, throw an error
      throw new APIError(`User with ID: ${req.params.id} not found`, 404);
    }

    res.status(200).json({ status: "success", data: { user } });
  } catch (err) {
    next(err);
  }
};

// Update a user by ID
const updateUserById = async (req, res, next) => {
  try {
    // Update user by ID using MongoDB's findByIdAndUpdate method
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true } // Options to return the updated user and validate input
    );

    if (!updatedUser) {
      throw new APIError(`User with ID: ${req.params.id} not found`, 404);
    }

    res.status(200).json({ status: "success", data: { user: updatedUser } });
  } catch (err) {
    next(err);
  }
};

// Delete a user by ID
const deleteUserById = async (req, res, next) => {
  try {
    // Delete the user from MongoDB by ID
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      throw new APIError(`User with ID: ${req.params.id} not found`, 404);
    }

    res.status(204).send(); // No content in response as user is deleted
  } catch (err) {
    next(err);
  }
};
module.exports = {
  signup,
  login,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};