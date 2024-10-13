/* eslint-disable prettier/prettier */
const {promisify} = require('util')
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userSchema');
const AppError = require('../utils/appError');

function getSignInToken(id){
    return jwt.sign({id: id},process.env.JWT_SECRET_KEY,{
        expiresIn: process.env.JWT_EXPIRE_IN
    })
}


exports.signUp = catchAsync(async (req,res,next) => {
    const newUser = await User.create(req.body);

    const token = getSignInToken(newUser._id);
    res.status(201).json({
        status : 'Success',
        token,
        data : newUser
    })
})

exports.login = catchAsync(async (req,res,next) => {
    const {email,password} = {...req.body};
    if(!email || !password){
        return next(new AppError('Please provide email and password',400));
    }
    const user = await User.findOne({email:email}).select('+password');
    if(!user || !(await user.compareUserPassword(password,user.password))){
        return next(new AppError('Please provide valid email and password',400));
    }
    const token = getSignInToken(user._id);
    res.status(200).json({
        status:'success',
        token
    })
});

exports.protect = catchAsync(async (req,res,next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('bearer')){
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token){
        return next(new AppError('You are not logged in.Kindly login with valid email and password!'))
    }

    const decode = await promisify(jwt.verify)(token,process.env.JWT_SECRET_KEY);

    //check user if it still exists
    const freshUser = await User.findById(decode.id).select('+passwordChangeAt');
    if(!freshUser){
        return next(new AppError('The token belonging to this user does not exists.'))
    }

    //check if the user changed password after the token was issued.

    if(!freshUser.changePasswordAfter(freshUser.passwordChangeAt , decode.iat)){
        return next(new AppError('The password has been changed.Please log in again'))
    }

    req.user = freshUser;
    console.log(decode);
    next();
})