const multer = require('multer');
const Doc = require('../models/documentModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'docs',)
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `doc-${req.user.id}-${Date.now()}.${ext}`)
  }
})

const upload = multer({ storage: multerStorage })
// const multerFilter = (req, file, cb)

exports.uploadSingle = upload.single('file');

exports.uploadFile = async (req, res, next) => {
  if (!req.file) return next(new AppError('Please provide a file!', 400));
  if (req.user.spaceUsed + req.file.size >= req.user.spaceLimit) return next(new AppError('User does not have enough space!'));

  // const name = req.file.mimet
  const doc = await Doc.create({
    name: req.file.filename,
    userId: req.user.id,
    docType: req.file.originalname.split('.')[1],
    fileLocation: req.file.path,
    access: req.body.access,
    tags: req.body.tags,
  })

  await User.findByIdAndUpdate(req.user.id, { spaceUsed: req.user.spaceUsed + req.file.size });

  res.status(200).json({
    message: 'success',
    data: {
      doc,
      spaceUsed: req.user.spaceUsed + req.file.size
    }
  })

};

exports.getAllDocs = async (req, res, next) => {
  let docs;
  if (req.user.role === 'admin') {
    docs = await Doc.find();
  } else {
    docs = await Doc.find({ access: 'public' });
    let userDocs = await Doc.find({ userId: req.user.id });
    docs = [...docs, ...(userDocs.filter(el => el.access === 'private'))]
  }

  if (!docs) return next(AppError('Cannot find any docs!', 401));

  res.status(200).json({
    message: 'success',
    data: docs
  })
}

exports.deleteDoc = async (req, res, next) => {
  const doc = await Doc.findById(req.params.id)
  if (!doc) return next(new AppError('No doc with this ID!', 401));

  if (req.user.role === 'admin' || req.user.id === doc.userId.toString()) {
    await Doc.findByIdAndDelete(req.params.id)

    res.status(200).json({
      message: 'success',
      data: null
    })

  } else {
    return next(new AppError('You do not have permission!', 401));
  }
}
