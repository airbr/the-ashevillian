const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');

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
  res.render('editStore', {title: 'Add Place'});
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
  const page = req.params.page || 1;
  const limit = 12;
  const skip = (page * limit) - limit;
  // 1. Query Database for List of All Stores
  const storesPromise = Store
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ created: 'desc'});

  const countPromise = Store.count();

  const [stores, count] = await Promise.all([storesPromise, countPromise]);

  const pages = Math.ceil(count / limit);

  if (!stores.length && skip) {
    req.flash('info', `Hey! You asked for page ${page}. But that doesn't exist. So I put you on page ${pages}`);
    res.redirect(`/stores/page/${pages}`);
    return;
  }

  res.render('stores', {title: 'Places', stores, page, pages, count });
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
      .populate('author reviews');
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

exports.mapStores = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  const q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: 100000
      }
    }
  };
  const stores = await Store.find(q).select('slug name description location photo').limit(10);
  res.json(stores);
};

exports.mapPage = (req, res) => {
  res.render('map', {title: 'Map'});
};

exports.heartStore = async (req, res) => {
  const hearts  = req.user.hearts.map(obj => obj.toString() );

  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
  const user = await User
      .findByIdAndUpdate(req.user._id,
          { [operator]: { hearts: req.params.id }},
          { new: true }
        );
  res.json(user);
};

exports.getHearts = async (req, res) => {

  const stores = await Store.find({
    _id: { $in: req.user.hearts }
  });

  res.render('stores', {title: 'Hearted Stores', stores })

};


exports.getTopStores = async (req, res) => {
  const stores = await Store.getTopStores();
  res.render('topStores', { stores, title: 'Top Stores!'});
};
