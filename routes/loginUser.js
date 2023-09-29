let express = require('express');
let router = express.Router();
let dbCon = require('../lib/db');

// display user data page
/* login page. */
router.get('/', function(req, res, next) {
    res.render('loginUser', { title: 'Express' });
  });

module.exports = router;