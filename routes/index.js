var express = require("express");
var router = express.Router();
let dbCon = require("../lib/db");
const bcrypt = require("bcrypt");

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

/* GET home page. */
router.get("/", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.render("index", { 
      title: "Home",
      emailS: "0",
      levelS: 0  
    });
  }
  res.render("index", { 
    title: "Home",
    emailS: req.session.emailUser,
    levelS: req.session.level  
  });
});

/* GET boardhealth page. */
router.get("/boardhealth", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.render("boardhealth", { 
      title: "Board Health",
      emailS: "0",
      levelS: 0  
    });
  }
  res.render("boardhealth", { 
    title: "Board Health",
    emailS: req.session.emailUser,
    levelS: req.session.level  
  });
});

/* GET shop page. */
router.get("/shop", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.render("shop", { 
      title: "Shop",
      emailS: "0",
      levelS: 0  
    });
  }
  res.render("shop", { 
    title: "Shop",
    emailS: req.session.emailUser,
    levelS: req.session.level  
  });
});

/* GET board page. */
router.get("/board", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.render("board", { 
      title: "Board",
      emailS: "0",
      levelS: 0  
    });
  }
  res.render("board", { 
    title: "Board",
    emailS: req.session.emailUser,
    levelS: req.session.level  
  });
});

/* GET boardcommunity page. */
router.get("/boardcommunity", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.render("boardcommunity", { 
      title: "Board Community",
      emailS: "0",
      levelS: 0  
    });
  }
  res.render("boardcommunity", { 
    title: "Board Community",
    emailS: req.session.emailUser,
    levelS: req.session.level  
  });
});

/* login page. */
router.get("/login", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    res.render("login", { 
      title: "Login",
      email: "",
      password: ""
    });
  }
  res.render("index", { 
    title: "Home",
    emailS: req.session.emailUser,
    levelS: req.session.level  
  });
});

//loginเข้าสู่ระบบ
router.post("/login/submit", (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;
  let errors = false;

  if (email.length === 0 || password.length === 0) {
    errors = true;
    // set flash message
    req.flash("error", "โปรดกรอกข้อมูลให้ครบถ้วน");
    // render to add.ejs with flash message
    res.render("login", {
      email: email,
      password: password,
    });
  } else {
    // email เช็ค
    dbCon.query(
      "SELECT * FROM tb_user WHERE email = " + '"' + email + '"',
      (err, rows) => {
        if (rows.length == 0) {
          errors = true;
          req.flash("error", "ไม่ข้อมูลผู้ใช้ " + email);
          res.render("login", {
            email: email,
            password: password,
          });
        } else {
          dbCon.query("SELECT * FROM tb_user WHERE email = " + '"' + email + '"',async (err, rows) => {
            if (rows.length == 1) {
                let chackpass = await bcrypt.compare(password, rows[0].password)
                if(chackpass){
                  req.session.ifNotLogIn = true;
                  let emailS = req.session.emailUser = rows[0].email;
                  let levelS = req.session.level = rows[0].level;
                  res.redirect("../");
                  // res.render("index", { 
                  //   title: "Home",
                  //   emailS: emailS,
                  //   levelS: levelS 
                  // });
                }else{
                  req.flash("error", "อีเมล์หรือรหัสผ่านไม่ถูกต้อง" + email);
                  res.render("login", {
                    email: email,
                    password: password,
                  });
                }
            }
        });

        }

      }
    );
  }
});


/* regis page. */
router.get("/register", function (req, res, next) {
  res.render("register", {
    title: "Register",
    email: "",
    fname: "",
    sname: "",
    password: "",
    confirmpassword: "",
  });
});

//Regsiter สมัครสมาชิก
router.post("/register/add", (req, res, next) => {
  let email = req.body.email;
  let fname = req.body.fname;
  let sname = req.body.sname;
  let password = req.body.password;
  let confirmpassword = req.body.confirmpassword;
  let level = req.body.level;
  let errors = false;

  if (
    email.length === 0 ||
    fname.length === 0 ||
    sname.length === 0 ||
    password.length === 0 ||
    confirmpassword.length === 0
  ) {
    errors = true;
    // set flash message
    req.flash("error", "โปรดกรอกข้อมูลให้ครบถ้วน");
    // render to add.ejs with flash message
    res.render("register", {
      email: email,
      fname: fname,
      sname: sname,
      password: password,
      confirmpassword: confirmpassword,
    });
  } else {
    // email เช็ค
    dbCon.query(
      "SELECT * FROM tb_user WHERE email = " + '"' + email + '"',
      (err, rows) => {
        if (rows.length !== 0) {
          errors = true;
          req.flash("error", "อีเมล์นี้มีผู้ใช้งานแล้ว " + email);
          res.render("register", {
            email: email,
            fname: fname,
            sname: sname,
            password: password,
            confirmpassword: confirmpassword,
          });
        } else {
          if (password !== confirmpassword) {
            errors = true;
            // set flash message
            req.flash("error", "รหัสผ่านยืนยันไม่ตรงกัน");
            // render กลับ
            res.render("register", {
              email: email,
              fname: fname,
              sname: sname,
              password: password,
              confirmpassword: confirmpassword,
            });
          }

          // if no error
          if (!errors) {
            bcrypt.hash(password, 12, function (error, hash) {
              let form_data = {
                fname: fname,
                sname: sname,
                email: email,
                password: hash,
                level: level,
                status: 1,
              };

              // insert query
              dbCon.query(
                "INSERT INTO tb_user SET ?",form_data,(err, result) => {
                  if (err) {
                    req.flash("error", err);

                    res.render("register", {
                      email: email,
                      fname: fname,
                      sname: sname,
                      password: password,
                      confirmpassword: confirmpassword,
                    });
                  } else {
                    req.flash("success", "สมัครสมาชิกสำเร็จ");
                    res.redirect("/login");
                  }
                }
              );

            });
          }
        }
      }
    );
  }
});

/* userData page. */
router.get("/user", ifNotLogIn,function (req, res, next) {
  dbCon.query("SELECT * FROM tb_user ORDER BY id asc", (err, rows) => {
    if (err) {
      req.flash("error", err);
      res.render("userData", { data: "" });
    } else {
      res.render("userData", { data: rows });
    }
  });
});

/* userData page. */
router.get("/logout", function (req, res, next)  {
  req.session.destroy();
  res.redirect("/");
});



module.exports = router;
