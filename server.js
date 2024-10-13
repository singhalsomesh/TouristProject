/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

const db = process.env.DATABASE_LOCAL;

process.on('uncaughtException' , err => {
  console.log(err.name , err.message);
  process.exit(1);
})

mongoose.set('strictQuery', false);
mongoose.connect(db).then(() => {
  console.log('db connection successfull');
});

const port = process.env.port || process.env.PORT;
const server = app.listen(port , () => {
    console.log(`server is started on port ${port}`);
})

process.on('unhandledRejection',err => {
  console.log(err.name,err.message);
  server.close(() => {
    process.exit(1);
  })
})


