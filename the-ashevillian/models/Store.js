const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
 name: {
   type: String,
   trim: true,
   required: 'Please Enter a Store Name'
 },
  slug: String,
  description: {
  trim: true,
  type: String
  },
  tags: [String],
  created: {
     type: Date,
     default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates'
    }],
    address: {
      type: String,
      required: 'You must supply an address'
    }
  },
  photo: String,
  author: {
   type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author'
  },
  websiteurl: String
}, {
  toJSON: { virtuals: true},
  toObject: { virtuals: true},
});

// Define our Indexes
storeSchema.index({
  name: 'text',
  description: 'text'
});

storeSchema.index({
  location: '2dsphere'
});

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next();
    return;
  }
   this.slug = slug(this.name);
  // anything with name or name-
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({slug: slugRegEx});

  if(storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
   next();
});

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count : { $sum: 1 } }},
    { $sort: { count: -1} }
  ]);
};

// storeSchema.statics.getTopStores = function (){
//   return this.aggregate([
//       // Look up stores and populate reviews
//     { $lookup: { from: 'reviews', localField: '_id',
//       foreignField: 'store', as: 'reviews'}},
//       // Filter for stores with 2 or more reviews
//     { $match: { 'reviews.1': { $exists: true } }},
//       // Add average reviews field
//       // TODO: Changed with $addfield in mongodb 3.4?
//       // UPDATE
//     { $project: {
//         photo: '$$ROOT.photo',
//         name: '$$ROOT.name',
//         reviews: '$$ROOT.reviews',
//         slug: '$$ROOT.slug',
//         averageRating: { $avg: '$reviews.rating' }
//       } },
//     // sort it by our new field, highest reviews first
//     { $sort: { averageRating: -1 }},
//     // limit to at most 10
//     { $limit: 10 }
//   ])
// };

// Find reviews where stores id === reviews store property
// Cant use in Aggregate !
storeSchema.virtual('reviews', {
  ref: 'Review', // What Model
  localField: '_id', // Which field on Store
  foreignField: 'store' // Which field on Review
});

function autopopulate(next) {
  this.populate('reviews');
  next();
}

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);


module.exports = mongoose.model('Store', storeSchema);