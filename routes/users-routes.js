const express = require("express");

const router = express.Router();

const usersControllers = require("../controllers/users-controllers");
const fileUpload = require("../middleware/file-upload");

const { check } = require("express-validator");

//we not call placesControllers.getPlaceById()
//because we dont need to execute it here too
// Express will execute it when it is called

router.get("/", usersControllers.getUsers);

router.post(
  "/signup",
  fileUpload.single('image'),
  [
    check("name")
      .not()
      .isEmpty(),
    check("email")
      .normalizeEmail() // PhUcThangVT@gmail.com => phucthangvt@gmail.com
      .isEmail(),
    check("password").isLength({ min: 6 })
  ],
  usersControllers.signup
);

router.post("/login", [
    check("email")
      .normalizeEmail() // PhUcThangVT@gmail.com => phucthangvt@gmail.com
      .isEmail(),
    check("password").isLength({ min: 6 })
  ], usersControllers.login);

module.exports = router;
