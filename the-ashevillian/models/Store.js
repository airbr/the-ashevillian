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
  }
});

storeSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next();
    return;
  }
   this.slug = slug(this.name);
   next();
   // TODO: Make to handle more unique names.
});

module.exports = mongoose.model('Store', storeSchema);