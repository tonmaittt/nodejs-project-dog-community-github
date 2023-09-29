var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* login page. */
router.get('/login', function(req, res, next) {
  res.render('loginUser', { title: 'Express' });
});

/* regis page. */
router.get('/regis', function(req, res, next) {
  res.render('regisUser', { title: 'Express' });
});

module.exports = router;
