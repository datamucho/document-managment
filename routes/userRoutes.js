const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.route("/")
  .post(userController.registerUser)
  .get(
    userController.protect,
    userController.restrictTo('admin'),
    userController.getAllUser);

router.route("/login").post(userController.authUser);

router.route("/delete/:id").delete(
  userController.protect,
  userController.restrictTo('admin'),
  userController.deleteUser);

router.route("/update/:id").patch(
  userController.protect,
  userController.restrictTo('admin'),
  userController.updateUser);

router.route("/:id").get(
  userController.protect,
  userController.restrictTo('admin'),
  userController.getUser);

router.route('/search/:key')
  .get(
    userController.protect,
    userController.restrictTo('admin'),
    userController.searchUsers)

module.exports = router;
