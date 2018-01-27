exports.myMiddleware = (req, res, next) => {
  req.name = 'Morgan';
  res.cookie('name', 'Morgan is learning node', {maxAge: 9000000 });
  next();
};
exports.homePage = (req, res) => {
  console.log(req.name);
  res.render('index');
};