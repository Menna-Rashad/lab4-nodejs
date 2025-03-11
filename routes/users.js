const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");
const { signup, login, getUsers, getUserById, updateUserById, deleteUserById } = usersController;
router.post("/signup", signup);
router.post("/login", login);

//only admin can gain the list of users 
router.get("/", getUsers);


// GET /users/:id -> get a user by id
router.get("/:id", getUserById);
// PUT /users/:id -> update a user by id
router.put("/:id", updateUserById);
// DELETE /users/:id -> delete a user by id
router.delete("/:id", deleteUserById);

module.exports = router;