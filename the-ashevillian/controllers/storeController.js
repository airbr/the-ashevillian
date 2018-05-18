const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
// Allows Resize
const jimp = require('jimp');
// Make filenames unique
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    //Yes file is fine or No not allowed
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto){
      // Node classic callbacks
      // Passed first value = error
      // Null, second value = what value needs to be passed along
      next(null, true);
    } else {
      next({ message: 'That filetype isn\'t allowed!' }, false);
    }
  }
};

exports.homePage = (req, res) => {
  console.log(req.name);
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', {title: 'Add Store'});
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if no new file tor resize
  if (!req.file){
    next(); // Skip to next middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  //now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  //Once we have written photo to filesystem, keep going
  next();
};

exports.createStore = async(req, res) => {
    req.body.author = req.user._id;
    const store = await (new Store(req.body)).save();
    req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
    res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // 1. Query Database for List of All Stores
  const stores = await Store.find();
  res.render('stores', {title: 'stores', stores });
};

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
   throw Error('You must own a store in order to edit');
  }
};

exports.editStore = async (req, res) => {
  // Find Store given Id
  const store =  await Store.findOne({ _id: req.params.id});

  // Confirm Owner of the Store
  confirmOwner(store, req.user);
  // Render Edit Form
  res.render('editStore', { title: `Edit ${store.name}`, store });

};

exports.updateStore = async (req, res) => {

  req.body.location.type = 'Point';
  // Find and update store
 // Redirect to Store and flash
  // Query, Data, Options - three args
  const store = await Store.findOneAndUpdate(
      {_id: req.params.id},
      req.body,
      { new: true, runValidators: true}).exec();
    req.flash('success', `Successfully updated ${store.name}. 
    <a href="/stores/${store.slug}">View Store</a>`);
    res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoreBySlug = async (req, res) => {
  const store = await Store.findOne({ slug: req.params.slug })
      .populate('author');
  if(!store) {
    next();
    return;
  }
  res.render('store', {store, title: store.name });
};

exports.getStoresByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || {$exists: true};
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  //Destructure into variables
  res.render('tags', {tags, title: 'Tags', tag, stores});
};

exports.searchStores = async (req, res) => {
  const stores = await Store.find({
    $text: {
      $search: req.query.q
    }
  }, {
    score:  { $meta: 'textScore' }
  })
    .sort({
      score: { $meta: 'textScore' }
  });
  res.json(stores);
};