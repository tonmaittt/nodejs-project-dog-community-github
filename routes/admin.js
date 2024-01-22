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
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
      return  res.render("adminData/login", { 
        title: "Login",
        email: "",
        password: ""
      });
    }
    next();
  }
    // index
    router.get('/',ifNotLogIn, (req, res, next) => {
        res.render('adminData/', { 
        title: "Home", 
        username: req.session.userName,
        emailS: req.session.emailUser,
        levelS: req.session.level,
        userImg: req.session.userImg,
        });
    })



    // ยืนยันผู้ใช้ ระดับ 2 ร้านค้า 
    router.get("/verifyUser", function (req, res, next) {
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }else{
            dbCon.query("SELECT * FROM tb_user_verified WHERE status = 0", (err, rows) => {
                if (err) {
                    req.flash("error", err);
                    res.render("adminData/verifyUser", {
                        title: "ยืนยันผู้ใช้",
                        username: req.session.userName,
                        emailS: req.session.emailUser,
                        levelS: req.session.level,
                        userImg: req.session.userImg,
                        email: "",
                        password: "",
                        rows: "",
                    });
                } else {
                    res.render("adminData/verifyUser", {
                        title: "ยืนยันผู้ใช้",
                        username: req.session.userName,
                        emailS: req.session.emailUser,
                        levelS: req.session.level,
                        userImg: req.session.userImg,
                        email: "",
                        password: "",
                        rows: rows,
                    });
                }
              });
        }
    });

    // ยืนยันผู้ใช้ ระดับ 2 ร้านค้า -> ยืนยัน
    router.get("/verifyUser/submit/(:id)", function (req, res, next) {
        let id = req.params.id;
        let form_data_point = {
            user_id: id,
            point: 0,
            status: 1,
        }
        let form_data = {
            level: 2,
        }
        let form_data_verified = {
            status: 1,
        }

        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }else{
            dbCon.query("SELECT * FROM tb_user_verified WHERE user_id = ?",[id] , (err, rows) => {
                if (err) {
                    req.flash("error", err);
                    res.redirect(req.get('referer'));
                } else {
                    dbCon.query("SELECT * FROM tb_point_user WHERE user_id = ?",[id] , (err, rowspoint) => {
                        if (err) {
                            req.flash("error", "ไม่สามารถค้นหา tb_point_user");
                            res.redirect(req.get('referer'));
                        } else {
                            dbCon.query("SELECT * FROM tb_user WHERE id = ?",[id] , (err, rowsusetSTD) => {
                                if (err) {
                                    req.flash("error", "ไม่สามารถค้นหา tb_user");
                                    res.redirect(req.get('referer'));
                                } else {
                                    if (rowsusetSTD[0].level > 2) {
                                        if (rowspoint.length == 1) {
                                            dbCon.query("UPDATE tb_user_verified SET ? WHERE user_id = ?" ,  [form_data_verified,id], (err, result) => {
                                                if (err) {
                                                    req.flash("error", "ไม่สามารถอัพเดท tb_user_verified");
                                                    res.redirect(req.get('referer'));
                                                } else {
                                                    req.flash('success', 'ยืนยันสำเร็จ ทำการเปลี่ยน status ของ tb_user_verified แล้ว');
                                                    res.redirect(req.get('referer'));
                                                }
                                            })
                                        }else{
                                            dbCon.query('INSERT INTO tb_point_user SET ?', form_data_point, (err, result) => {
                                                if (err) {
                                                    req.flash('error', err)
                                                    res.redirect(req.get('referer'));
                                                } else {
                                                    dbCon.query("UPDATE tb_user_verified SET ? WHERE user_id = ?" ,[form_data_verified,id], (err, result) => {
                                                        if (err) {
                                                            req.flash("error", err);
                                                            res.redirect(req.get('referer'));
                                                        } else {
                                                            req.flash('success', 'เพิ่มข้อมูล point ทำการเปลี่ยน status ของ tb_user_verified แล้ว และ ยืนยันสำเร็จ');
                                                            res.redirect(req.get('referer'));
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    }else{
                                        if (rowspoint.length == 1) {
                                            dbCon.query("UPDATE tb_user SET ? WHERE id = ?"  ,[form_data, id], (err, result) => {
                                                if (err) {
                                                    req.flash("error", err);
                                                    res.redirect(req.get('referer'));
                                                } else {
                                                    dbCon.query("UPDATE tb_user_verified SET ? WHERE user_id = ?" ,  [form_data_verified,id], (err, result) => {
                                                        if (err) {
                                                            req.flash("error", err);
                                                            res.redirect(req.get('referer'));
                                                        } else {
                                                            req.flash('success', 'tb_user tb_user_verified และ ยืนยันสำเร็จ ');
                                                            res.redirect(req.get('referer'));
                                                        }
                                                    })
                                                }
                                            })
                                        }else{
                                            dbCon.query('INSERT INTO tb_point_user SET ?', form_data_point, (err, result) => {
                                                if (err) {
                                                    req.flash('error', err)
                                                    res.redirect(req.get('referer'));
                                                } else {
                                                    dbCon.query("UPDATE tb_user SET ? WHERE id = ?" ,  [form_data,id], (err, result) => {
                                                        if (err) {
                                                            req.flash("error", err);
                                                            res.redirect(req.get('referer'));
                                                        } else {
                                                            dbCon.query("UPDATE tb_user_verified SET ? WHERE user_id = ?" ,[form_data_verified,id], (err, result) => {
                                                                if (err) {
                                                                    req.flash("error", err);
                                                                    res.redirect(req.get('referer'));
                                                                } else {
                                                                    req.flash('success', 'เพิ่มข้อมูล point tb_user tb_user_verified และ ยืนยันสำเร็จ');
                                                                    res.redirect(req.get('referer'));
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    }
                                    
                                }
                            });
                        }
                    });
                }
            });
        }
    });

    // ยืนยันผู้ใช้ ระดับ 3 ผู้เชี่ยวชาญ
    router.get("/verifyVets", function (req, res, next) {
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }else{
            dbCon.query("SELECT * FROM tb_vets WHERE status = 0", (err, rows) => {
                if (err) {
                    req.flash("error", err);
                    res.render("adminData/verifyVets", {
                        title: "ยืนยันผู้เชี่ยวชาญ",
                        username: req.session.userName,
                        emailS: req.session.emailUser,
                        levelS: req.session.level,
                        userImg: req.session.userImg,
                        email: "",
                        password: "",
                        rows: "",
                    });
                } else {
                    res.render("adminData/verifyVets", {
                        title: "ยืนยันผู้เชี่ยวชาญ",
                        username: req.session.userName,
                        emailS: req.session.emailUser,
                        levelS: req.session.level,
                        userImg: req.session.userImg,
                        email: "",
                        password: "",
                        rows: rows,
                    });
                }
              });
        }
    });

    // ยืนยันผู้ใช้ ระดับ 3 ผู้เชี่ยวชาญ -> ยืนยัน
    router.get("/verifyVets/submit/(:id)", function (req, res, next) {
        let id = req.params.id;
        let form_data_point = {
            user_id: id,
            point: 0,
            status: 1,
        }
        let form_data = {
            level: 3,
        }
        let form_data_verified = {
            status: 1,
        }

        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }else{
            dbCon.query("SELECT * FROM tb_vets WHERE user_id = ?",[id] , (err, rows) => {
                if (err) {
                    req.flash("error", err);
                    res.redirect(req.get('referer'));
                } else {
                    dbCon.query("SELECT * FROM tb_point_user WHERE user_id = ?",[id] , (err, rowspoint) => {
                        if (err) {
                            req.flash("error", "ไม่สามารถค้นหา tb_point_user");
                            res.redirect(req.get('referer'));
                        } else {
                            dbCon.query("SELECT * FROM tb_user WHERE id = ?", [id] , (err, rowsusetSTD) => {
                                if (err) {
                                    req.flash("error", "ไม่สามารถค้นหา tb_user");
                                    res.redirect(req.get('referer'));
                                } else {
                                    if (rowsusetSTD[0].level > 3) {
                                        if (rowspoint.length == 1) {
                                            dbCon.query("UPDATE tb_vets SET ? WHERE user_id = ?" ,  [form_data_verified,id], (err, result) => {
                                                if (err) {
                                                    req.flash("error", "ไม่สามารถอัพเดท tb_vets");
                                                    res.redirect(req.get('referer'));
                                                } else {
                                                    req.flash('success', 'ยืนยันสำเร็จ ทำการเปลี่ยน status ของ tb_vets แล้ว');
                                                    res.redirect(req.get('referer'));
                                                }
                                            })
                                        }else{
                                            dbCon.query('INSERT INTO tb_point_user SET ?', form_data_point, (err, result) => {
                                                if (err) {
                                                    req.flash('error', err)
                                                    res.redirect(req.get('referer'));
                                                } else {
                                                    dbCon.query("UPDATE tb_vets SET ? WHERE user_id = ?" ,[form_data_verified,id], (err, result) => {
                                                        if (err) {
                                                            req.flash("error", err);
                                                            res.redirect(req.get('referer'));
                                                        } else {
                                                            req.flash('success', 'เพิ่มข้อมูล point ทำการเปลี่ยน status ของ tb_vets แล้ว และ ยืนยันสำเร็จ');
                                                            res.redirect(req.get('referer'));
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    }else{
                                        if (rowspoint.length == 1) {
                                            dbCon.query("UPDATE tb_user SET ? WHERE id = ?"  ,[form_data, id], (err, result) => {
                                                if (err) {
                                                    req.flash("error", err);
                                                    res.redirect(req.get('referer'));
                                                } else {
                                                    dbCon.query("UPDATE tb_vets SET ? WHERE user_id = ?" ,  [form_data_verified,id], (err, result) => {
                                                        if (err) {
                                                            req.flash("error", err);
                                                            res.redirect(req.get('referer'));
                                                        } else {
                                                            req.flash('success', 'tb_user tb_vets และ ยืนยันสำเร็จ ');
                                                            res.redirect(req.get('referer'));
                                                        }
                                                    })
                                                }
                                            })
                                        }else{
                                            dbCon.query('INSERT INTO tb_point_user SET ?', form_data_point, (err, result) => {
                                                if (err) {
                                                    req.flash('error', err)
                                                    res.redirect(req.get('referer'));
                                                } else {
                                                    dbCon.query("UPDATE tb_user SET ? WHERE id = ?" ,  [form_data,id], (err, result) => {
                                                        if (err) {
                                                            req.flash("error", err);
                                                            res.redirect(req.get('referer'));
                                                        } else {
                                                            dbCon.query("UPDATE tb_vets SET ? WHERE user_id = ?" ,[form_data_verified,id], (err, result) => {
                                                                if (err) {
                                                                    req.flash("error", err);
                                                                    res.redirect(req.get('referer'));
                                                                } else {
                                                                    req.flash('success', 'เพิ่มข้อมูล point tb_user tb_vets และ ยืนยันสำเร็จ');
                                                                    res.redirect(req.get('referer'));
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    }
                                    
                                }
                            });
                        }
                    });
                }
            });
        }
    });

    // ยืนยันผู้ใช้ เติมพอทย์ 
    router.get("/confirmAddPoint", function (req, res, next) {
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }else{
            dbCon.query("SELECT * FROM tb_add_point WHERE status = 0", (err, rows) => {
                if (err) {
                    req.flash("error", err);
                    res.render("adminData/verifyUser", {
                        title: "ยืนยัน เติมพอทย์",
                        username: req.session.userName,
                        emailS: req.session.emailUser,
                        levelS: req.session.level,
                        userImg: req.session.userImg,
                        email: "",
                        password: "",
                        rows: "",
                    });
                } else {
                    res.render("adminData/confirmAddPoint", {
                        title: "ยืนยัน เติมพอทย์",
                        username: req.session.userName,
                        emailS: req.session.emailUser,
                        levelS: req.session.level,
                        userImg: req.session.userImg,
                        email: "",
                        password: "",
                        rows: rows,
                    });
                }
                });
        }
    });

    // ยืนยันผู้ใช้ เติมพอทย์  -> ยืนยัน
    router.get("/confirmAddPoint/submit/(:id)", function (req, res, next) {
        let id = req.params.id;

        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }else{
            dbCon.query("SELECT * FROM tb_point WHERE point_id = 1", (err, point) => {
                if (err) {
                    req.flash('error', err)
                    res.redirect(req.get('referer'));
                } else {
                    if (point[0].status != 0) {
                        dbCon.query("SELECT * FROM tb_add_point WHERE add_point_id = ?",[id], (err, addpoint) => {
                            if (err) {
                                req.flash('error', err)
                                res.redirect(req.get('referer'));
                            } else {
                                if (point[0].point >= addpoint[0].money) {
                                    let form = {
                                        add_point_id: id,
                                        user_id: addpoint[0].user_id,
                                        admin_id: req.session.idUser,
                                        status: 1,
                                    }
                                    let form2 = {
                                        status: 1,
                                    }
                                    dbCon.query("UPDATE tb_point SET point = point - ? WHERE point_id = ?" ,  [addpoint[0].money,1], (err, result) => {
                                        if (err) {
                                            req.flash("error", err);
                                            res.redirect(req.get('referer'));
                                        } else {
                                            dbCon.query("UPDATE tb_point_user SET point = point + ? WHERE user_id = ?" ,  [addpoint[0].money,addpoint[0].user_id], (err, result) => {
                                                if (err) {
                                                    req.flash("error", err);
                                                    res.redirect(req.get('referer'));
                                                } else {
                                                    dbCon.query('INSERT INTO tb_confirm_add_point SET ?', form, (err, result) => {
                                                        if (err) {
                                                            req.flash('error', err)
                                                            res.redirect(req.get('referer'));
                                                        } else {
                                                            dbCon.query("UPDATE tb_add_point SET ? WHERE add_point_id = ?" ,  [form2,id], (err, result) => {
                                                                if (err) {
                                                                    req.flash("error", err);
                                                                    res.redirect(req.get('referer'));
                                                                } else {
                                                                    req.flash("success", 'ยืนยันเติมพอทย์สำเร็จ');
                                                                    res.redirect(req.get('referer'));
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                } else {
                                    req.flash('error', 'พอทย์ในระบบไม่เพียงพอ')
                                    res.redirect(req.get('referer'));
                                }
                            }
                        });
                    }else {
                        req.flash('error', 'ระบบไม่เปิดใช้งานขณะนี้')
                        res.redirect(req.get('referer'));
                    }
                    
                }
            });
        }
    });





    // ยืนยันผู้ใช้ ถอนพอทย์ 
    router.get("/confirmOutPoint", function (req, res, next) {
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }else{
            dbCon.query("SELECT * FROM tb_out_point WHERE status = 0", (err, rows) => {
                if (err) {
                    req.flash("error", err);
                    res.render("adminData/confirmOutPoint", {
                        title: "ยืนยัน ถอนพอทย์ ",
                        username: req.session.userName,
                        emailS: req.session.emailUser,
                        levelS: req.session.level,
                        userImg: req.session.userImg,
                        email: "",
                        password: "",
                        rows: "",
                    });
                } else {
                    res.render("adminData/confirmOutPoint", {
                        title: "ยืนยัน ถอนพอทย์ ",
                        username: req.session.userName,
                        emailS: req.session.emailUser,
                        levelS: req.session.level,
                        userImg: req.session.userImg,
                        email: "",
                        password: "",
                        rows: rows,
                    });
                }
            });
        }
    });

    // ยืนยันผู้ใช้ ถอนพอทย์ -> ยืนยัน
    router.post("/confirmOutPoint/submit", upload.single("photo"), (req, res, next) => {
        let out_point_id = req.body.out_point_id;
        let user_id = req.body.user_id;
        let photo = req.file.filename;
        let errors = false;
        

        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }else{
            dbCon.query("SELECT * FROM tb_point_user WHERE user_id = ?",[user_id], (err, point) => {
                if (err) {
                    req.flash('error', err)
                    res.redirect(req.get('referer'));
                } else {
                    if (point[0].status != 0) {
                        dbCon.query("SELECT * FROM tb_out_point WHERE out_point_id = ?",[out_point_id], (err, outpoint) => {
                            if (err) {
                                req.flash('error', err)
                                res.redirect(req.get('referer'));
                            } else {
                                if (point[0].point >= outpoint[0].money) {
                                    let form_data = {
                                        out_point_id: out_point_id,
                                        user_id: user_id,
                                        admin_id: req.session.idUser,
                                        photo: photo,
                                        status: 1,
                                    };
                                    let form2 = {
                                        status: 1,
                                    }
                                    dbCon.query("UPDATE tb_point_user SET point = point - ? WHERE user_id = ?" ,  [outpoint[0].money,user_id], (err, result) => {
                                        if (err) {
                                            req.flash("error", err);
                                            res.redirect(req.get('referer'));
                                        } else {
                                            dbCon.query("UPDATE tb_out_point SET ? WHERE out_point_id = ?" ,  [form2,out_point_id], (err, result) => {
                                                if (err) {
                                                    req.flash("error", err);
                                                    res.redirect(req.get('referer'));
                                                } else {
                                                    dbCon.query('INSERT INTO tb_confirm_out_point SET ?', form_data, (err, result) => {
                                                        if (err) {
                                                            req.flash('error', err)
                                                            res.redirect(req.get('referer'));
                                                        } else {
                                                            req.flash("success", 'ยืนยันถอนพอทย์สำเร็จ');
                                                            res.redirect(req.get('referer'));
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                } else {
                                    req.flash('error', 'พอทย์ของผู้ใช้ไม่เพียงพอ')
                                    res.redirect(req.get('referer'));
                                }
                            }
                        });
                    }else {
                        req.flash('error', 'ระบบไม่เปิดใช้งานขณะนี้')
                        res.redirect(req.get('referer'));
                    }
                    
                }
            });
        }
    });

    //loginเข้าสู่ระบบ แสดง
    router.get("/login", function (req, res, next) {
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "Login",
            email: "",
            password: "",
        });
        }
        res.render("admin/", {
        title: "Home",
        username: req.session.userName,
        emailS: req.session.emailUser,
        levelS: req.session.level,
        userImg: req.session.userImg,
        });
    });

    //loginเข้าสู่ระบบ
    router.post("/loginadmin/submit", (req, res, next) => {
        let email = req.body.email;
        let password = req.body.password;
        let errors = false;
    
        if (email.length === 0 || password.length === 0) {
        errors = true;
        // set flash message
        req.flash("error", "โปรดกรอกข้อมูลให้ครบถ้วน");
        // render to add.ejs with flash message
        // res.redirect("/login");
        res.render("adminData/login", {
            title: "Login",
            emailS: "0",
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
                // req.flash("error", "ไม่ข้อมูลผู้ใช้ " + email);
                req.flash("error", "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
                // res.redirect("/login");
                res.render("adminData/login", {
                title: "Login",
                emailS: "0",
                email: email,
                password: "",
                });
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
                        if (rows[0].level == 4) {
                            req.session.ifNotLogIn = true;
                            req.session.idUser = rows[0].id;
                            req.session.emailUser = rows[0].email;
                            req.session.level = rows[0].level;
                            req.session.userName = rows[0].username;
                            req.session.userImg = rows[0].img;
                            res.redirect("../");
                        }else{
                            req.flash("error", "ไม่มีสิทธิเข้าใช้งาน");
                            res.render("adminData/login", {
                                title: "Login",
                                emailS: "0",
                                email: email,
                                password: "",
                            });
                        }
                    } else {
                        req.flash("error", "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
                        // res.redirect("/login");
                        res.render("adminData/login", {
                        title: "Login",
                        email: email,
                        password: "",
                        });
                    }
                    }
                }
                );
            }
            }
        );
        }
    });

    router.get("/backHome", function (req, res, next) {
        if (!req.session.ifNotLogIn) {
            res.redirect("../");
        }
            res.redirect("../");
    });

    //กรณีไม่พบหน้า
    router.get('*', (req, res)=>{
        res.status(404).send('Page Not Found');
    });

module.exports = router;


