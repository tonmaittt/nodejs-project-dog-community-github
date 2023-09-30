let express = require('express');
let router = express.Router();
let dbCon = require('../lib/db');

// display page
router.get('/', (req, res, next) => {
  res.render('regisUser', {
    email: '',
    fname: '',
    sname: '',
    passw: '',
    conpassw: ''
  });
});

// สมัครสมาชิก Register user
router.post('/add', (req, res, next) => {
  let email = req.body.email;
  let fname = req.body.fname;
  let sname = req.body.sname;
  let passw = req.body.passw;
  let conpassw = req.body.conpassw;
  let errors = false;

  if (
    email.length === 0 ||
    fname.length === 0 ||
    sname.length === 0 ||
    passw.length === 0 ||
    conpassw.length === 0
  ) {
    errors = true;
    // set flash message
    req.flash('error', 'Please enter name and subname');
    // render to add.ejs with flash message
    res.render('/regis', {
      email: email,
      fname: fname,
      sname: sname,
      passw: passw,
      conpassw: conpassw
    });
  }

  // if no error
  if (!errors) {
    let form_data = {
      email: email,
      fname: fname,
      sname: sname,
      passw: passw,
      conpassw: conpassw
    };

    // insert query
    dbCon.query('INSERT INTO tb_user SET ?', form_data, (err, result) => {
      if (err) {
        req.flash('error', err);

        res.render('regisUser', {
          fname: form_data.fname,
          sname: form_data.sname,
        });
      } else {
        req.flash('success', 'User successfully added');
        res.redirect('/loginUser');
      }
    });
  }
});

module.exports = router;
