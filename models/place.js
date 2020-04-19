const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const placeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" }
});

//export by constructor function of mongoose
//input: 1. model Name 2. model schema
//Usually model Name should start with uppercase character and a singular form
// The collection later we use will not have uppercase character and it will be plural though -> places
module.exports = mongoose.model("Place", placeSchema);
