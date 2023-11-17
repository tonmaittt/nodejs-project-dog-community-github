var express = require("express");
var router = express.Router();
let dbCon = require("../lib/db");
const bcrypt = require("bcrypt");
const escape = require("escape-html");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./img"); //ตำแหน่งจัดเก็บไฟล์
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        "-" +
        file.originalname +
        ".jpg"
    ); // เปลี่ยนชื่อไฟล์
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      // ตรวจสอบนามสกุลของไฟล์
      cb(null, true);
    } else {
      cb(new Error("รูปภาพเท่านั้นที่อนุญาต"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // จำกัดขนาดไฟล์ไม่เกิน 5MB
  },
});

const ifNotLogIn = (req, res, next) => {
  if (!req.session.ifNotLogIn) {
    return res.render("login", {
      title: "Login",
      email: "",
      password: "",
    });
  }
  next();
};

/* -------------------------------------------------------------- หน้าแรก ------------------------------------------------------------------------------------------------------ */
/* GET home page. */
router.get("/", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.render("index", {
      title: "Home",
      username: "0",
      emailS: "0",
      levelS: 0,
    });
  }
  res.render("index", {
    title: "Home",
    username: req.session.userName,
    emailS: req.session.emailUser,
    levelS: req.session.level,
  });
});

/* -------------------------------------------------------------- หน้าบอร์ดสุขภาพสุนัข ------------------------------------------------------------------------------------------------------ */

/* GET boardhealth page. */
router.get("/boardhealth", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return dbCon.query(
      "SELECT tb_boardhealth.boardhealth_id,tb_boardhealth.title,tb_boardhealth.photo,tb_boardhealth.details,tb_boardhealth.status,tb_boardhealth.view,tb_boardhealth.created_at,tb_boardhealth.update_at, tb_user.username FROM tb_boardhealth INNER JOIN tb_user ON tb_boardhealth.user_id = tb_user.id ORDER BY boardhealth_id asc",
      (err, rows) => {
        if (err) {
          req.flash("error", err);
          res.render("boardhealth", {
            title: "Board Health",
            username: "0",
            emailS: "0",
            levelS: 0,
            data: "",
          });
        } else {
          res.render("boardhealth", {
            title: "Board Health",
            username: "0",
            emailS: "0",
            levelS: 0,
            data: rows,
          });
        }
      }
    );
  }
  dbCon.query(
    "SELECT tb_boardhealth.boardhealth_id,tb_boardhealth.title,tb_boardhealth.photo,tb_boardhealth.details,tb_boardhealth.status,tb_boardhealth.view,tb_boardhealth.created_at,tb_boardhealth.update_at, tb_user.username FROM tb_boardhealth INNER JOIN tb_user ON tb_boardhealth.user_id = tb_user.id ORDER BY boardhealth_id asc",
    (err, rows) => {
      if (err) {
        req.flash("error", err);
        res.render("boardhealth", {
          title: "Board Health",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          data: "",
        });
      } else {
        res.render("boardhealth", {
          title: "Board Health",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          data: rows,
        });
      }
    }
  );
});

// display boardhealth add page
router.get("/boardhealthAdd", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.redirect("/boardhealth");
    // res.render("boardhealth", {
    //   title: "Board Health",
    //   username: "0",
    //   emailS: "0",
    //   levelS: 0,
    // });
  }
  res.render("boardhealthAdd", {
    title: "สร้างกระทู้ Board Health",
    username: req.session.userName,
    emailS: req.session.emailUser,
    levelS: req.session.level,
    titleboard: "",
    photo: "",
    details: "",
  });
});

// add a new boardhealth
router.post("/boardhealthAdd", upload.single("photo"), (req, res, next) => {
  let titleboard = req.body.titleboard;
  let photo = req.file.filename;
  let details = req.body.details;
  let errors = false;

  if (titleboard.length === 0) {
    errors = true;
    // set flash message
    req.flash("error", "โปรดใส่หัวข้อกระทู้");
    // render to add.ejs with flash message
    res.render("boardhealthAdd", {
      title: "สร้างกระทู้ Board Health",
      username: req.session.userName,
      emailS: req.session.emailUser,
      levelS: req.session.level,
      titleboard: titleboard,
      photo: "",
      details: details,
    });
  }

  // if no error
  if (!errors) {
    let form_data = {
      user_id: req.session.idUser,
      title: titleboard,
      photo: photo,
      details: details,
      status: 1,
    };

    // insert query
    dbCon.query(
      "INSERT INTO tb_boardhealth SET ?",
      form_data,
      (err, result) => {
        if (err) {
          req.flash("error", err);
          res.render("boardhealthAdd", {
            title: "สร้างกระทู้ Board Health",
            username: req.session.userName,
            emailS: req.session.emailUser,
            levelS: req.session.level,
            titleboard: titleboard,
            photo: "",
            details: details,
          });
        } else {
          req.flash("success", "สร้างกระทู้สำเร็จ");
          res.redirect("/boardhealth");
        }
      }
    );
  }
});

// display boardhealthDetail page
router.get("/boardhealthDetail/(:id)", (req, res, next) => {
  let id = req.params.id;
  if (!req.session.ifNotLogIn) {
    return dbCon.query(
      "SELECT * FROM tb_boardhealth WHERE boardhealth_id = " + id,
      (err, rows, fields) => {
        if (rows.length <= 0) {
          req.flash("error", "ไม่พบกระทู้ = " + id);
          res.redirect("/boardhealth");
        } else {
          dbCon.query(
            "SELECT * FROM tb_user WHERE id = " + rows[0].user_id,
            (err, rows2, fields) => {
              if (rows2.length <= 0) {
                req.flash("error", "ไม่พบกระทู้ = " + id);
                res.redirect("/boardhealth");
              } else {
                res.render("boardhealthDetail", {
                  title: "รายละเอียดบอร์ดสุขภาพสุนัช",
                  username: "0",
                  emailS: "0",
                  levelS: 0,
                  id: rows[0].boardhealth_id,
                  titletext: rows[0].title,
                  photo: rows[0].photo,
                  details: rows[0].details,
                  createdP: rows[0].created_at,
                  namehead: rows2[0].username,
                  imghead: rows2[0].img,
                });
              }
            }
          );
        }
      }
    );
  }
  dbCon.query("SELECT * FROM tb_boardhealth WHERE boardhealth_id = " + id,(err, rows, fields) => {
      if (rows.length <= 0) {
        req.flash("error", "ไม่พบกระทู้ = " + id);
        res.redirect("/boardhealth");
      } else {
        dbCon.query(
          "SELECT * FROM tb_user WHERE id = " + rows[0].user_id,(err, rows2, fields) => {
            if (rows2.length <= 0) {
              req.flash("error", "ไม่พบกระทู้ = " + id);
              res.redirect("/boardhealth");
            } else {
              res.render("boardhealthDetail", {
                title: "รายละเอียดบอร์ดสุขภาพสุนัข",
                username: req.session.userName,
                emailS: req.session.emailUser,
                levelS: req.session.level,
                id: rows[0].boardhealth_id,
                titletext: rows[0].title,
                photo: rows[0].photo,
                details: rows[0].details,
                createdP: rows[0].created_at,
                namehead: rows2[0].username,
                imghead: rows2[0].img,
              });
            }
          }
        );
      }
    }
  );
});

/* -------------------------------------------------------------- หน้าชุมชน - บอร์ด ------------------------------------------------------------------------------------------------------ */

/* GET boardcommunity page. */
router.get("/board", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return dbCon.query(
      "SELECT tb_communityboard.communityboard_id,tb_communityboard.title,tb_communityboard.photo,tb_communityboard.details,tb_communityboard.status,tb_communityboard.view,tb_communityboard.created_at,tb_communityboard.update_at,tb_user.username,tb_user.img FROM tb_communityboard INNER JOIN tb_user ON tb_communityboard.user_id = tb_user.id ORDER BY communityboard_id asc",
      (err, rows) => {
        if (err) {
          req.flash("error", err);
          res.render("board", {
            title: "Board",
            username: "0",
            emailS: "0",
            levelS: 0,
            data: "",
          });
        } else {
          res.render("board", {
            title: "Board",
            username: "0",
            emailS: "0",
            levelS: 0,
            data: rows,
          });
        }
      }
    );
  }
  dbCon.query(
    "SELECT tb_communityboard.communityboard_id,tb_communityboard.title,tb_communityboard.photo,tb_communityboard.details,tb_communityboard.status,tb_communityboard.view,tb_communityboard.created_at,tb_communityboard.update_at, tb_user.username,tb_user.img FROM tb_communityboard INNER JOIN tb_user ON tb_communityboard.user_id = tb_user.id ORDER BY communityboard_id asc",
    (err, rows) => {
      if (err) {
        req.flash("error", err);
        res.render("board", {
          title: "Board",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          data: "",
        });
      } else {
        res.render("board", {
          title: "board",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          data: rows,
        });
      }
    }
  );
});

// display board add page
router.get("/boardAdd", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.redirect("/board");
  }
  res.render("boardAdd", {
    title: "สร้างกระทู้ Board",
    username: req.session.userName,
    emailS: req.session.emailUser,
    levelS: req.session.level,
    titleboard: "",
    photo: "",
    details: "",
  });
});

// add a new boardhealth
router.post("/boardAdd", upload.single("photo"), (req, res, next) => {
  let titleboard = req.body.titleboard;
  let photo = req.file.filename;
  let details = req.body.details;
  let errors = false;

  if (titleboard.length === 0) {
    errors = true;
    // set flash message
    req.flash("error", "โปรดใส่หัวข้อกระทู้");
    // render to add.ejs with flash message
    res.render("boardAdd", {
      title: "สร้างกระทู้ Board",
      username: req.session.userName,
      emailS: req.session.emailUser,
      levelS: req.session.level,
      titleboard: titleboard,
      photo: "",
      details: details,
    });
  }

  // if no error
  if (!errors) {
    let form_data = {
      user_id: req.session.idUser,
      title: titleboard,
      photo: photo,
      details: details,
      status: 1,
    };

    // insert query
    dbCon.query(
      "INSERT INTO tb_communityboard SET ?",
      form_data,
      (err, result) => {
        if (err) {
          req.flash("error", err);
          res.render("boardAdd", {
            title: "สร้างกระทู้ Board",
            username: req.session.userName,
            emailS: req.session.emailUser,
            levelS: req.session.level,
            titleboard: titleboard,
            photo: "",
            details: details,
          });
        } else {
          req.flash("success", "สร้างกระทู้สำเร็จ");
          res.redirect("/board");
        }
      }
    );
  }
});

// display boardhealthDetail page
router.get("/boardDetail/(:id)", (req, res, next) => {
  let id = req.params.id;
  if (!req.session.ifNotLogIn) {
    return dbCon.query(
      "SELECT * FROM tb_communityboard WHERE communityboard_id = " + id,
      (err, rows, fields) => {
        if (rows.length <= 0) {
          req.flash("error", "ไม่พบกระทู้ = " + id);
          res.redirect("/board");
        } else {
          dbCon.query(
            "SELECT * FROM tb_user WHERE id = " + rows[0].user_id,
            (err, rows2, fields) => {
              if (rows2.length <= 0) {
                req.flash("error", "ไม่พบกระทู้ = " + id);
                res.redirect("/board");
              } else {
                res.render("boardDetail", {
                  title: "รายละเอียดบอร์ดสุขภาพสุนัช",
                  username: "0",
                  emailS: "0",
                  levelS: 0,
                  id: rows[0].boardhealth_id,
                  titletext: rows[0].title,
                  photo: rows[0].photo,
                  details: rows[0].details,
                  createdP: rows[0].created_at,
                  namehead: rows2[0].username,
                  imghead: rows2[0].img,
                });
              }
            }
          );
        }
      }
    );
  }
  dbCon.query("SELECT * FROM tb_communityboard WHERE communityboard_id = " + id,(err, rows, fields) => {
      if (rows.length <= 0) {
        req.flash("error", "ไม่พบกระทู้ = " + id);
        res.redirect("/board");
      } else {
        dbCon.query(
          "SELECT * FROM tb_user WHERE id = " + rows[0].user_id,(err, rows2, fields) => {
            if (rows2.length <= 0) {
              req.flash("error", "ไม่พบกระทู้ = " + id);
              res.redirect("/board");
            } else {
              res.render("boardDetail", {
                title: "รายละเอียดบอร์ดสุขภาพสุนัข",
                username: req.session.userName,
                emailS: req.session.emailUser,
                levelS: req.session.level,
                id: rows[0].boardhealth_id,
                titletext: rows[0].title,
                photo: rows[0].photo,
                details: rows[0].details,
                createdP: rows[0].created_at,
                namehead: rows2[0].username,
                imghead: rows2[0].img,
              });
            }
          }
        );
      }
    }
  );
});

/* -------------------------------------------------------------- หน้าชุมชน - บทความ ------------------------------------------------------------------------------------------------------ */


/* GET article page. */
router.get("/boardcommunity", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return dbCon.query(
      "SELECT tb_article.article_id,tb_article.title,tb_article.photo,tb_article.details,tb_article.status,tb_article.view,tb_article.created_at,tb_article.update_at,tb_user.username,tb_user.img FROM tb_article INNER JOIN tb_user ON tb_article.user_id = tb_user.id ORDER BY article_id asc",
      (err, rows) => {
        if (err) {
          req.flash("error", err);
          res.render("article", {
            title: "Board Community Article",
            username: "0",
            emailS: "0",
            levelS: 0,
            data: "",
          });
        } else {
          res.render("article", {
            title: "Board Community Article",
            username: "0",
            emailS: "0",
            levelS: 0,
            data: rows,
          });
        }
      }
    );
  }
  dbCon.query(
    "SELECT tb_article.article_id,tb_article.title,tb_article.photo,tb_article.details,tb_article.status,tb_article.view,tb_article.created_at,tb_article.update_at,tb_user.username,tb_user.img FROM tb_article INNER JOIN tb_user ON tb_article.user_id = tb_user.id ORDER BY article_id asc",
    (err, rows) => {
      if (err) {
        req.flash("error", err);
        res.render("article", {
          title: "Board Community Article",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          data: "",
        });
      } else {
        res.render("article", {
          title: "Board Community Article",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          data: rows,
        });
      }
    }
  );
});

// display article add page
router.get("/articleAdd", function (req, res, next) {
  if (!req.session.ifNotLogIn || req.session.level === 1) {
    return res.redirect("/boardcommunity");
  }
  res.render("articleAdd", {
    title: "สร้างบทความ Article",
    username: req.session.userName,
    emailS: req.session.emailUser,
    levelS: req.session.level,
    titleboard: "",
    photo: "",
    details: "",
  });
});

// add a new article
router.post("/articleAdd", upload.single("photo"), (req, res, next) => {
  let titleboard = req.body.titleboard;
  let photo = req.file.filename;
  let details = req.body.details;
  let errors = false;

  if (titleboard.length === 0) {
    errors = true;
    // set flash message
    req.flash("error", "โปรดใส่หัวข้อกระทู้");
    // render to add.ejs with flash message
    res.render("articleAdd", {
      title: "สร้างบทความ Article",
      username: req.session.userName,
      emailS: req.session.emailUser,
      levelS: req.session.level,
      titleboard: titleboard,
      photo: "",
      details: details,
    });
  }

  // if no error
  if (!errors) {
    let form_data = {
      user_id: req.session.idUser,
      title: titleboard,
      photo: photo,
      details: details,
      status: 1,
    };

    // insert query
    dbCon.query(
      "INSERT INTO tb_article SET ?",
      form_data,
      (err, result) => {
        if (err) {
          req.flash("error", err);
          res.render("articleAdd", {
            title: "สร้างบทความ Article",
            username: req.session.userName,
            emailS: req.session.emailUser,
            levelS: req.session.level,
            titleboard: titleboard,
            photo: "",
            details: details,
          });
        } else {
          req.flash("success", "สร้างบทความสำเร็จ");
          res.redirect("/boardcommunity");
        }
      }
    );
  }
});

// display articleDetail page
router.get("/articleDetail/(:id)", (req, res, next) => {
  let id = req.params.id;
  if (!req.session.ifNotLogIn) {
    return dbCon.query(
      "SELECT * FROM tb_article WHERE article_id = " + id,
      (err, rows, fields) => {
        if (rows.length <= 0) {
          req.flash("error", "ไม่พบบทความ = " + id);
          res.redirect("/article");
        } else {
          dbCon.query(
            "SELECT * FROM tb_user WHERE id = " + rows[0].user_id,
            (err, rows2, fields) => {
              if (rows2.length <= 0) {
                req.flash("error", "ไม่พบบทความ = " + id);
                res.redirect("/article");
              } else {
                res.render("articleDetail", {
                  title: "รายละเอียดบทความ",
                  username: "0",
                  emailS: "0",
                  levelS: 0,
                  id: rows[0].boardhealth_id,
                  titletext: rows[0].title,
                  photo: rows[0].photo,
                  details: rows[0].details,
                  createdP: rows[0].created_at,
                  namehead: rows2[0].username,
                  imghead: rows2[0].img,
                });
              }
            }
          );
        }
      }
    );
  }
  dbCon.query("SELECT * FROM tb_article WHERE article_id = " + id,(err, rows, fields) => {
      if (rows.length <= 0) {
        req.flash("error", "ไม่พบบทความ = " + id);
        res.redirect("/article");
      } else {
        dbCon.query(
          "SELECT * FROM tb_user WHERE id = " + rows[0].user_id,(err, rows2, fields) => {
            if (rows2.length <= 0) {
              req.flash("error", "ไม่พบบทความ = " + id);
              res.redirect("/article");
            } else {
              res.render("articleDetail", {
                title: "รายละเอียดบทความ",
                username: req.session.userName,
                emailS: req.session.emailUser,
                levelS: req.session.level,
                id: rows[0].boardhealth_id,
                titletext: rows[0].title,
                photo: rows[0].photo,
                details: rows[0].details,
                createdP: rows[0].created_at,
                namehead: rows2[0].username,
                imghead: rows2[0].img,
              });
            }
          }
        );
      }
    }
  );
});


/* -------------------------------------------------------------- หน้าร้านค้า ------------------------------------------------------------------------------------------------------ */

/* GET shop page. */
router.get("/shop", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.render("shop", {
      title: "Shop",
      username: "0",
      emailS: "0",
      levelS: 0,
    });
  }
  res.render("shop", {
    title: "Shop",
    username: req.session.userName,
    emailS: req.session.emailUser,
    levelS: req.session.level,
  });
});



/* login page. */
router.get("/login", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    res.render("login", {
      title: "Login",
      email: "",
      password: "",
      emailS: "0",
    });
  }
  res.render("index", {
    title: "Home",
    username: req.session.userName,
    emailS: req.session.emailUser,
    levelS: req.session.level,
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
    res.redirect("/login");
    // res.render("login", {
    //   title: "Login",
    //   emailS: "0",
    //   email: email,
    //   password: password,
    // });
  } else {
    // email เช็ค
    dbCon.query(
      "SELECT * FROM tb_user WHERE email = " + '"' + email + '"',
      (err, rows) => {
        if (rows.length == 0) {
          errors = true;
          // req.flash("error", "ไม่ข้อมูลผู้ใช้ " + email);
          req.flash("error", "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
          res.redirect("/login");
          // res.render("login", {
          //   email: email,
          //   password: password,
          // });
        } else {
          dbCon.query(
            "SELECT * FROM tb_user WHERE email = " + '"' + email + '"',
            async (err, rows) => {
              if (rows.length == 1) {
                let chackpass = await bcrypt.compare(
                  password,
                  rows[0].password
                );
                if (chackpass) {
                  req.session.ifNotLogIn = true;
                  req.session.idUser = rows[0].id;
                  req.session.emailUser = rows[0].email;
                  req.session.level = rows[0].level;
                  req.session.userName = rows[0].username;
                  res.redirect("../");
                  // res.render("index", {
                  //   title: "Home",
                  //   emailS: emailS,
                  //   levelS: levelS
                  // });
                } else {
                  req.flash("error", "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
                  res.redirect("/login");
                  // res.render("login", {
                  //   email: email,
                  //   password: password,
                  // });
                }
              }
            }
          );
        }
      }
    );
  }
});

/* regis page. */
router.get("/register", function (req, res, next) {
  res.render("register", {
    title: "Register",
    emailS: "0",
    email: "",
    username: "",
    fname: "",
    sname: "",
    password: "",
    confirmpassword: "",
  });
});

//Regsiter สมัครสมาชิก
router.post("/register/add", (req, res, next) => {
  let email = req.body.email;
  let username = req.body.username;
  let fname = req.body.fname;
  let sname = req.body.sname;
  let password = req.body.password;
  let confirmpassword = req.body.confirmpassword;
  let level = 1;
  let errors = false;

  if (
    email.length === 0 ||
    username.length === 0 ||
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
      emailS: "0",
      email: email,
      username: username,
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
          req.flash("error", "อีเมลนี้มีผู้ใช้งานแล้ว " + email);
          res.render("register", {
            email: email,
            username: username,
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
              emailS: "0",
              email: email,
              username: username,
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
                username: username,
                fname: fname,
                sname: sname,
                email: email,
                password: hash,
                level: level,
                img: "user-icon.jpg",
                status: 1,
              };

              // insert query
              dbCon.query(
                "INSERT INTO tb_user SET ?",
                form_data,
                (err, result) => {
                  if (err) {
                    req.flash("error", err);

                    res.render("register", {
                      emailS: "0",
                      email: email,
                      username: username,
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
router.get("/user", ifNotLogIn, function (req, res, next) {
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
router.get("/logout", function (req, res, next) {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
