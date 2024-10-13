/* eslint-disable prettier/prettier */

const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
    name : {
      type : String,
      required : [true,'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength : [40 , 'A tour must have less than or equal 40 character'],
      minlength : [8 , 'A tour must greater than or equal 8 character']
    },
    duration: {
      type : Number,
      required : [true , 'A tour must have a duration']
    },
    maxGroupSize : {
      type : Number,
      required : [true,'A tour must have a group size']
    },
    difficulty : {
      type : String,
      required : [true , 'A tour must have a difficulty level'],
      enum : {
        values : ["easy","medium","difficult"],
        message : "Difficulty is either : easy , medium and difficult"
      }
    },
    ratingsAverage: {
      type : Number,
      default : 4.5
    },
    ratingQuantity : {
      type : Number,
      default : 4,
      min: [1 , "A tour must have minimum 1 rating"],
      max : [5 , "A tour must have maximum 5 ratings"]
    },
    price : {
      type : Number,
      required : [true,'A tour must have a price']
    },
    priceDiscount : {
      type : Number,
      validate : {
        validator : function(val){
          return val < this.price;
        },
        message : 'discount price ({VALUE}) is not less than actual price'
      }
    },
    summary : {
      type : String,
      trim : true
    },
    slug : String,
    description : {
      type : String,
      trim : true,
      required : [true , 'A tour must have a description']
    },
    imageCover : {
      type : String ,
      required : [true , 'A tour must have a cover image']
    },
    images : [String],
    createdAt : {
      type : Date,
      default : Date.now(),
      select:false
    },
    startDates : [Date],
    secretTour : {
      type : Boolean,
      default : false
    }
},{
  toJSON : {virtuals: true},
  toObject : {virtuals : true}
})


tourSchema.virtual('durationWeeks').get(function(){
  return this.duration/7;
})


//document middleware : run before save or create command
//not trigger in case of insertmany()
tourSchema.pre('save',function(next){
  this.slug = slugify(this.name,{lower : true});
  next();
})

tourSchema.post('save',function(doc,next){
  console.log(doc);
  next();
})

tourSchema.pre('aggregate' , function(next){
  this.pipeline().unshift({
      $match : {secretTour : {$ne : true}}
  })
  console.log(this.pipeline());
  next();
})



const Tour = mongoose.model('Tour',tourSchema);
module.exports = Tour;

