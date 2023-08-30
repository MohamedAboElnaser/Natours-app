const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    await Model.findByIdAndDelete(req.params.id, (err) => {
      if (err)
        next(new AppError('The document is not found with that ID :(', 404));
    });

    res.status(204).json({
      status: 'document deleted successfuly:)',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc)
      return next(
        new AppError('There is no document found with this ID :(', 404)
      );
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.creatOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const query = await Model.findById(req.params.id);
    if (populateOptions) query.populate(populateOptions);
    const doc = await query;

    if (!doc)
      return next(
        new AppError('The document is not found with that ID :(', 404)
      );
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    //these two lines of code for allowing the nested GET reviews on a tour(HACK)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // execute the quary to return the documents
    const features = new APIFeatures(Model.find(filter), req.query)
      .projection() //<--here is BUG when useing filter:((
      .filter()
      .sort()
      .pagination();
    const docs = await features.query;
    // console.log(docs);
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });
