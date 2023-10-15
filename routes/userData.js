let express = require('express');
let router = express.Router();
let dbCon = require('../lib/db');

const ifNotLogIn = (req, res, next) => {
    if (!req.session.ifNotLogIn) {
      return  res.render("login", { 
        title: "Login",
        email: "",
        password: ""
      });
    }
    next();
  }

// display user data page
router.get('/', (req, res, next) => {
    dbCon.query('SELECT * FROM tb_user ORDER BY id asc', (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.render('userData', { data: '' });
        } else {
            res.render('userData', { data: rows });
        }
    })
})

// display add page
router.get('/add', (req, res, next) => {
    res.render('userData/add', {
        fname: '',
        sname: ''
    })
})

// add a new book
router.post('/add', (req, res, next) => {
    let fname = req.body.fname;
    let sname = req.body.sname;
    let errors = false;

    if (fname.length === 0 || sname.length === 0) {
        errors = true;
        // set flash message
        req.flash('error', 'Please enter name and subname');
        // render to add.ejs with flash message
        res.render('userData/add', {
            fname: fname,
            sname: sname
        })
    }

    // if no error
    if (!errors) {
        let form_data = {
            fname: fname,
            sname: sname
        }

        // insert query
        dbCon.query('INSERT INTO tb_user SET ?', form_data, (err, result) => {
            if (err) {
                req.flash('error', err)

                res.render('userData/add', {
                    fname: form_data.fname,
                    sname: form_data.sname
                })
            } else {
                req.flash('success', 'User successfully added');
                res.redirect('/userData');
            }
        })
    }
})

// display edit page
router.get('/edit/(:id)', (req, res, next) => {
    let id = req.params.id;

    dbCon.query('SELECT * FROM tb_user WHERE id = ' + id, (err, rows, fields) => {
        if (rows.length <= 0) {
            req.flash('error', 'User not found with id = ' + id)
            res.redirect('/userData');
        } else {
            res.render('userData/edit', {
                title: 'Edit User',
                id: rows[0].id,
                fname: rows[0].fname,
                sname: rows[0].sname
            })
        }
    });
})

// update page
router.post('/update/:id', (req, res, next) => {
    let id = req.params.id;
    let fname = req.body.fname;
    let sname = req.body.sname;
    let errors = false;

    if (fname.length === 0 || sname.length === 0) {
        errors = true;
        req.flash('error', 'Please enter fname and sname');
        res.render('userData/edit', {
            id: req.params.id,
            fname: fname,
            sname: sname
        })
    }
    // if no error
    if (!errors) {
        let form_data = {
            fname: fname,
            sname: sname
        }
        // update query
        dbCon.query("UPDATE tb_user SET ? WHERE id = " + id, form_data, (err, result) => {
            if (err) {
                req.flash('error', err);
                res.render('userData/edit', {
                    id: req.params.id,
                    fname: form_data.fname,
                    sname: form_data.sname
                })
            } else {
                req.flash('success', 'User successfully updated');
                res.redirect('/userData')
            }
        })
    }
})

// delete user
router.get('/delete/(:id)', (req, res, next) => {
    let id = req.params.id;

    dbCon.query('DELETE FROM tb_user WHERE id = ' + id, (err, result) => {
        if (err) {
            req.flash('error', err),
            res.redirect('/userData');
        } else {
            req.flash('success', 'User successfully deleted! ID = ' + id);
            res.redirect('/userData');
        }
    })
})

router.get("/backHome", function (req, res, next) {
    if (!req.session.ifNotLogIn) {
        res.redirect("../");
    }
        res.redirect("../");
  });

module.exports = router;


