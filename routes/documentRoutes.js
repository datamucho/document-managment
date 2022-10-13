const express = require("express");
const docController = require('../controllers/docController')
const userController = require('./../controllers/userController');

const router = express.Router();


router.use(userController.protect);

router.route('/')
  .post(docController.uploadSingle, docController.uploadFile)
  .get(docController.getAllDocs);

router.route('/:id').delete(docController.deleteDoc);

module.exports = router;