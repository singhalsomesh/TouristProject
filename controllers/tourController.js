/* eslint-disable lines-between-class-members */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unsupported-features/es-syntax */
const fs = require('fs');
const Tour = require('./../models/tourModel');
const APIFeautres = require('./../utils/APIFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);




// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);

//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     });
//   }
//   next();
// };

exports.aliasTours = (req,res,next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverag,price';
  req.query.fields = 'name,price,ratingsAverag,summary,difficulty';
  next();
}

exports.getAllTours =catchAsync(async (req, res,next) => {
  const features = new APIFeautres(Tour.find(),req.query)
                .filter()
                .sort()
                .fields();
  const allTours = await features.query;
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      allTours
    }
  });
});

exports.getTour = catchAsync(async (req, res,next) => {
    const tour = await Tour.findById(req.params.id);
    if(!tour){
      return next(new AppError(`A tour was not found with id ${req.params.id}` , 404))
    }
    res.status(200).json({
        status: 'success',
        data: {
          tour
        }
      });
});

exports.createTour = catchAsync(async (req, res,next) => {
  const newTour = await Tour.create(req.body)
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
});

exports.updateTour = catchAsync(async (req, res,next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id , req.body, {
      new : true
    });
    if(!tour){
      return next(new AppError(`A tour was not found with id ${req.params.id}` , 404))
    }
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
});

exports.deleteTour = catchAsync(async (req, res,next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if(!tour){
      return next(new AppError(`A tour was not found with id ${req.params.id}` , 404))
    }
    res.status(200).json({
      status: 'success',
      message : 'A tour is deleted successfully'
    });
});


exports.getTourStats = catchAsync(async (req,res,next) => {
    const stats = await Tour.aggregate([
      {
        $match : {
          ratingsAverage : {$gte : 4.5}
        }
      },
      {
        $group : {
          _id : {
            $toUpper : '$difficulty'
          },
          numTours : {$sum: 1},
          numRatings : {$sum : '$ratingQuantity'},
          avgRating : {$avg: '$ratingsAverage'},
          avgPrice : {$avg : '$price'},
          minPrice : {$min : '$price'},
          maxPrice : {$max : '$price'}
        }  
      },
      {
        $sort: { avgPrice : 1}
      }
      // {
      //   $match: {_id: {$ne: 'EASY'}}
      // }
    ])

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
});

exports.getMonthlyPlan = catchAsync(async (req,res,next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind : '$startDates'
      },
      {
        $match : {
            startDates : {
                $gte : new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31`)
            }
        }
      },
      {
        $group : {
            _id : {
                $month : "$startDates"
            },
            numberOfMonth : {$sum : 1},
            tour : {
                $push : "$name"
            }
        }
      },
      {
        $addFields : {
            month : "$_id"
        }
    },
    {
        $project : {
            _id : 0
        }
    },
    {
        $sort : {
            month : -1
        }
    }
    ])
    res.status(200).json({
      status: 'success',
      data: plan
    });
});