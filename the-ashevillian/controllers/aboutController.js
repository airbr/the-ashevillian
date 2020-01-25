const mongoose = require('mongoose');
const Review = mongoose.model('Review');
const User = mongoose.model('User');


exports.showAbout = async (req, res) => {

    // const reviewer = await Review.find({ "author": {_id: req.user }})

    const reviewer = await Review.find({ author: { _id: req.user._id } })
   
     
    console.log(reviewer);

    // reviewer = res.user;

    res.render('about', { title: 'About', reviewer: reviewer});
};

