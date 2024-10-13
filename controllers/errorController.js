/* eslint-disable prettier/prettier */

const AppError = require("../utils/appError");


const handleError = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`
  return new AppError(message,400);
}

const handleDuplicateError = (err) => {
  const dupValue = err.message.match( /\{(.*?)\}/);
  const message = `dublicate field value : ${dupValue[0]} . please use another value !`;
  return new AppError(message,400);
}

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid inputs : ${errors.join('. ')}`;
  return new AppError(message,400);
}

const handleJsonWebTokenError = (err) => {
  return new AppError('Invalid token! Please login again',400);
}

const handleTokenExpireError = (err) => {
  return new AppError('Token has been expired , Please login again',400);
}

const sendDevError = (err,res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack : err.stack,
    error : err
  });
}


const sendProdError = (err,res) => {
  if(err.isOperational){
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }else{
    console.log(`Error : ${err}`)
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
}


module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === process.env.NODE_ENV_DEV){
      sendDevError(err,res);
    }else if(process.env.NODE_ENV === process.env.NODE_ENV_PROD){
      let error = {...err};
      error.name = err.name;
      error.message = err.message;
      if(error.name === "CastError"){
        error = handleError(error);
      }
      if(error.code === 11000){
        error = handleDuplicateError(error);
      }

      if(error.name === "ValidationError"){
        error = handleValidationError(error);
      }
      if(error.name === "JsonWebTokenError"){
        error = handleJsonWebTokenError(error);
      }
      if(error.name === "TokenExpiredError"){
        error = handleTokenExpireError(error);
      }
      sendProdError(error,res);
    }
    
  }