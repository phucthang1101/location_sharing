const HttpError = require('../models/http-error');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  try {
    //extract token from incoming REQUEST_HEADER
    // in front-end when send request, we set header like this:
    // "Authorization": "Bearer (token)" so here we split end get [1] to have token
    const token = req.headers.authorization.split(' ')[1];
   
    if (!token) {
    }
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
   
    req.userData = { userId: decodedToken.userId };
    //let it continue
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed', 401);
    return next(error);
  }
};
