const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const Review = mongoose.model('Review');


exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.registerForm = (req, res) => {
  res.render('register', {title: 'Register'});
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply a name').notEmpty();
  req.checkBody('email','That email is not valid').notEmpty();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Password cannot be blank').notEmpty();
  req.checkBody('password-confirm', 'Confirmed Password cannot be blank').notEmpty();
  req.checkBody('password-confirm', 'Oops, your passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', { title: 'Register', body: req.body,
    flashes: req.flash() });
    return;
  }
  next();
};


exports.register = async (req, res, next) => {

  const existinguser = await User.findOne({email: req.body.email});
  if(existinguser)
  {
    req.flash('error', 'An account is already registered to that email.');
    res.redirect('/register');
  }

  const user = new User({ email: req.body.email, name: req.body.name });
  // User.register(user, req.body.password, function(err, user){
    //
    // });
  // Make method that is promisified. If method trying to promisify lives on an object
  // you need to pass entire object i.e User
  const register = promisify(User.register, User);
  await register(user, req.body.password);

  next();
};



// exports.showReviews = async (req, res, next) => {

//     const reviews = await Review.find({ author: { _id: req.user._id } });
//     next();
// };

exports.account = async (req, res) => {

  const reviews = await Review.find({ author: { _id: req.user._id } });


  res.render('account', { title: 'Edit Your Account', reviews: reviews});

};

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: updates },
      { new: true, runValidators: true, context: 'query'}
  );
  req.flash('success', 'Updated the profile!');
  res.redirect('back');
};
