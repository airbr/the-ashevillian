const express = require('express');
const router = express.Router();

// Do work here
router.get('/', (req, res) => {

  const hello = { name: 'Morgan Murrah', age: 28, dev: true };

  // res.json(hello);
  // res.send('Hey! It works!');
  // res.send(req.query.name);
  //    res.json(req.query);
  res.render('hello', {
    name: 'Morgan',
    dog: req.query.dog
  });
});


router.get('/reverse/:name', (req, res) => {

  const reverse = [...req.params.name].reverse().join('');
  res.send(reverse);
});

module.exports = router;
