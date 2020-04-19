const fs = require("fs");
const path = require('path');
const express = require("express");
const bodyParser = require("body-parser");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

const HttpError = require("./models/http-error");
const app = express();
const mongoose = require("mongoose");

// nodejs run from code to bottom so
// I have to this middleware before it get to the route
app.use(bodyParser.json());

//express.static() return file only, NOT execute anything
//path.join('uploads','images') -> build a new path pointing at the uploads and any file in there, if we request there, will be return and all other file is locked down
app.use("/uploads/images", express.static(path.join('uploads','images')));

//CORS policy : No header is present on the request resource... means =>
// => It is about the request in HTTP: you are not allowed to call from domain 1 cross to domain 2 ex localhost:3000 -> localhost:5000
// First: browser send message to server
// Then: server send back to browser
// in that response to browser, server has to attach certain headers

//this middleware is adding certain headers to the response.
// the response is then execute and return by 2 middleware down there (placesRoutes & usersRoutes) and till that the header here has already been attached
app.use((req, res, next) => {
  // this Access-Control-Allow-Origin allows all domain to send request
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use("/api/places", placesRoutes); // => /api/places/..
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});

//unique route when Express get this route
// It will handle error
app.use((error, req, res, next) => {
  if (req.file) {
    // if there is any error when u deal with file it will save file before it can reach error in controller
    // so then it will be lead to here so u need to delete it by using fs.unlink()
    fs.unlink(req.file.path, (err) => {
      //this callback function can be call when delete file done
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({
    message: error.message || "An unknow error occurred !",
  });
});

//connect() return promise
//so we use then for resolve
//and catch for reject and hanlde err
console.log(
)
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@thangtran-ckqo8.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => {
    console.log(err);
  });
