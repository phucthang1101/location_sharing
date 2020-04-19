const fs = require('fs');
const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");

// let DUMMY_PLACES = [
//   {
//     id: "p1",
//     title: "Empire State Building",
//     description: "One of the most famous sky scrapers in the world!",
//     location: {
//       lat: 40.7484474,
//       lng: -73.9871516
//     },
//     address: "20 W 34th St, New York, NY 10001",
//     creator: "u1"
//   }
// ];

//function expression
const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  //using DUMMY_PLACES
  // const place = DUMMY_PLACES.find(place => {
  //   return place.id === placeId;
  // });

  //using MongoDB:
  // Because finding by ID is a task could get more time so it should be an asynchronous task right here
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided id",
      404
    );
    return next(error);
  }

  //first thing:
  // the object here we get when return is a 'MONGOOSE OBJECT'
  // that s why it has so many special Mongoose method available inside import PropTypes from 'prop-types'
  // it is fine for creating and working part but it might be easier to use if we convert it to the normal JS object
  //using method toObject

  // second thing:
  // get rid of : _id turn it to => id
  //using getters: true
  res.json({
    place: place.toObject({ getters: true })
  });
};

//function declaration
//function getPlaceById(){...}

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  //filter => return array
  //find => return only one object that fit condition
  //DUMMY_PLACES ver:

  // const places = DUMMY_PLACES.filter(place => {
  //   return place.creator === userId;
  // });

  //working with MongoDB:
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate("places");
    

  } catch (err) {
    const error = new HttpError(
      "Fetching places failed, please try again later",
      500
    );
    return next(error);
  }

  if (!userWithPlaces || userWithPlaces.length === 0) {
    return next(
      new Error("Could not find places for the provided user id", 404)
    );
  }

  //above we use method find, it is different from the findbyId
  // find return an array and findById return an object
  // so here we have to map through array and apply .toObject to every element
  res.json({
    places: userWithPlaces.places.map(place =>
      place.toObject({ getters: true })
    )
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }
  //get parse body in:
  //{} object destructuring
  const { title, description, address } = req.body;
  //instead of doing this : const title = req.body.title

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image:req.file.path,
    creator: req.userData.userId
  });

  //push: add at last position
  //unshift : add to head of arr
  //DUMMY_PLACES.push(createdPlace);

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again", 500);
  }

  if (!user) {
    const error = new HttpError("Could not find the user for provided id", 400);
    return next(error);
  }

  //work with MongoDB
  //save() method will automatically create unique id
  //save() return promise

  //Transaction : let u execute MULTIPLE operations in isolation
  //and potentially undo all the opearations if one of them fails
  try {
    // To start transaction,first startSession()
    const sess = await mongoose.startSession();

    //then call the SESSION'S startTransaction() function
    sess.startTransaction();

    // To execute an operation in a transaction, u need to pass SESSION as an option
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);

    // Here to, pass SESSION as an option
    await user.save({ session: sess });

    // Commiting the transaction if it succeeds
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating place failed,please try again", 500);
    return next(error);
  }

  //create something new will say status is 201
  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const { title, description } = req.body;

  const placeId = req.params.pid;

  //do not update directly like this:
  //updatedPlace.title = title;
  //because object in JS is reference
  //so when update like that the object in DUMMY_PLACES will be changed the value inside import PropTypes from 'prop-types'
  //we will update it immutable

  //First copy all value of object to updatedPlace
  //const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };

  //console.log(updatedPlace);

  //Second, find index in array
  // const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);

  //wondering why the CONST updatedPlace can be changed ?
  // because in reference value
  //const only store the address of object and not object itself
  // console.log("placeIndex: ",placeIndex);

  //update all to copy value
  // updatedPlace.title = title;
  //updatedPlace.description = description;

  //replace origin object in Array by new updatedPlace
  // DUMMY_PLACES[placeIndex] = updatedPlace;

  //not create any thing new so return status code 200 means success
  //res.status(200).json({ place: updatedPlace });

  //MongoDB version:
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place",
      400
    );
    return next(error);
  }

  //place.creator was stored in MongoDB as an ObjectId() type because it a foregn key of user table
  // so now we have to convert it from ObjectId --> string to compare with req.userData.userId
  if(place.creator.toString() !== req.userData.userId){
    const error = new HttpError(
      'You are not allowed to update this place.',
      401
    );
    return next(error)
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place",
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  // if (!DUMMY_PLACES.find(p => p.id === placeId)) {
  //   throw new HttpError("Could not find a place to delete", 404);
  // }
  // //ban đầu gán DUMMY_PLACE với khai báo const sẽ không thực hiện việc này được
  // // vì filter trả về array thay đổi cả biến const sẽ báo lỗi
  // // nên cần đổi lại khai báo DUMMY_PLACES là let
  // DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);

  //MongoDB version:
  let place;
  try {
    //populate() reference entire documents in other collection if they have relation
    // if there is no relation yet, it returns undefine
    // if there is relation but no id is the same, it returns [] or null
    // if there are both relation and id , it return all the document in that property of object
    place = await Place.findById(placeId).populate("creator");
    //example: here if the creator id exists in the User document, which we set reference to import PropTypes from 'prop-types'
    // we can call : place.creator.email or place.creator.password , ... etc
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place",
      400
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError("Could not find place for this id", 404);
    return next(error);
  }

  if(place.creator.id !== req.userData.userId)
  {
    const error = new HttpError(
      'You are not allowed to delete this place.',
      401
    );
    return next(error)
  }
  const imagePath = place.image;

  //Here we need to delete not only the place in PLACES DOC but also place in USER.PLACE
  // So we use transaction() like creating part
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    //add section here to make sure we refer to the current session
    await place.remove({ session: sess });

    // SEE !! creator property is now like a USER document
    // we will PULL(like delete) placeID from USER.places
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });

    //Done !!
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place",
      500
    );
    return next(error);
  }

  fs.unlink(imagePath,err=>{
    console.log(err)
  });

  res.status(200).json({
    message: "Delete place"
  });
};

// here we dont execute the function , so we dont write like this
// exports.getPlaceById = getPlaceById();
// we just assign a pointer to event getPlaceById
// then when it is call, Express will execute it
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
