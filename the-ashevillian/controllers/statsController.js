const mongoose = require('mongoose');
const Store = mongoose.model('Store');


exports.showStats = async (req, res) => {
  // 1. Query Database for List of All Stores
  const stores = await Store.find();
  res.render('stats', {title: 'stores', stores });
};