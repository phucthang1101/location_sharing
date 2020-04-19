const express = require('express');

const { check } = require('express-validator');
const router = express.Router();

const placesControllers = require('../controllers/places-controllers');
const fileUpload = require('../middleware/file-upload');
//we not call placesControllers.getPlaceById()
//because we dont need to execute it here too
// Express will execute it when it is called
router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacesByUserId);

// Why put this authorization here?
// Because when some one access any route, It will go from top to bottom and find the suitable route,
// Put authorization here means we allow everyone to access 2 routes above( getPlaceById & getPlacesByUserId) 
//but if the request without a valid token will reach those routes below. so it will be handle in this middleware right here.
const checkAuth = require('../middleware/check-auth')
router.use(checkAuth);

//here we call check() and execute it because it need to be execute not just pointer to it
router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty(),
  ],
  placesControllers.createPlace
);

router.patch(
  '/:pid',
  [check('title').not().isEmpty(), check('description').isLength({ min: 5 })],
  placesControllers.updatePlace
);

router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
