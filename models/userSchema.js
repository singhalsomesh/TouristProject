/* eslint-disable eqeqeq */
/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true , 'A user must have a name']
    },
    email : {
        type : String,
        required : [true , 'A user must have an email'],
        unique : true,
        lowercase : true ,
        validate : [validator.isEmail , 'Please provide valid email!']      
    },
    photo : {
        type : String
    },
    password : {
        type : String,
        required : [true , 'please provide a password'],
        minlength : [8 , 'password has atleast 8 character'],
        select: false
    },
    confirmPassword : {
        type : String,
        validate : {
            //this is only work on create and save!
            validator : function(el){
                return el == this.password;
            },
            message : 'password and confirm password must be same'
        }
    },
    passwordChangeAt : {
        type : Date,
        select : false
    } 
})

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password,12);
    this.confirmPassword = undefined;
    next();
})

userSchema.methods.compareUserPassword = async function(candidatePassword , userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
}


userSchema.methods.changePasswordAfter = function(passwordChangeAt,jwtTimeStamp){

    if(passwordChangeAt){
        const changeTimeStamp = parseInt(passwordChangeAt.getTime() / 1000,10);
        return jwtTimeStamp < changeTimeStamp;
    }
    return false;
}

const userModel = mongoose.model('user' ,userSchema);

module.exports = userModel;

