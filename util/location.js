const axios = require("axios");
const HttpError = require("../models/http-error");
var NodeGeocoder = require("node-geocoder");

var geocoder = NodeGeocoder({
  provider: "opencage",
  apiKey: "f189939c62e7471598c9eada1bbc6600"
});

// const getCoordsForAddress = (address) =>{
//     return {
//         lat: 40.7484474,
//         lng: -73.9871516
//     }
// }

const getCoordsForAddress = async address => {
  // const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`)
  const response = await geocoder.geocode(address);
 
 
  if (response.length === 0) {
     
    const error = new HttpError(
      "Could not find location for the specified address.",
      422
    );
    throw error;
  } else {
    var place = response[0];
    const coordinates ={
        lat:place.latitude,
        lng: place.longitude
    } 
   
   return coordinates;
  }
  //    if (data.status.code == 200) {
  //     if (data.results.length > 0) {
  //       var place = data.results[0];
  //       console.log('place.formatted: ',place.formatted);
  //       console.log('place.geometry: ',place.geometry);

  //     }
  //   }
  //   if (!data || data.status === 'ZERO_RESULTS') {
  //     const error = new HttpError(
  //       'Could not find location for the specified address.',
  //       422
  //     );
  //     throw error;
  //   }
  //   console.log("data: ",data)
  //   const coordinates = data.results[0].geometry.location;

  //   return coordinates;
};

module.exports = getCoordsForAddress;
