/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../models/tourModel');


dotenv.config({ path: './config.env' });

const db = 'mongodb://127.0.0.1:27017/natour-tour';
mongoose.set('strictQuery', false);
mongoose.connect(db).then(() => {
  console.log('db connection successfull');
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/data/tours-simple.json`, 'utf-8'));

const createTour = async () => {
    try{
        await Tour.create(tours);
        console.log('data successfully loaded');
    }catch(err){
        console.log(err);
    }
    process.exit();
}

const deleteTour = async () => {
    try{
        await Tour.deleteMany();
        console.log('data is deleted successfully');
    }catch(err){
        console.log(err)
    }
    process.exit();
}

if(process.argv[2] === '--import'){
    createTour();
}else if(process.argv[2] === '--delete'){
    deleteTour();
}