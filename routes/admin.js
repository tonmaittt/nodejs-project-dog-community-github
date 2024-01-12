var express = require("express");
var router = express.Router();
let dbCon = require("../lib/db");
const bcrypt = require("bcrypt");
const escape = require("escape-html");
const multer = require("multer");

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
        res.render('adminData/', { title: "Home", });
    })

    router.get("/login", function (req, res, next) {
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "Login",
            emailS: "0",
            email: "",
            password: "",
        });
        }
        res.render("admin/", {
        title: "Home",
        });
    });

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
                        emailS: "0",
                        email: "",
                        password: "",
                        rows: "",
                    });
                } else {
                    res.render("adminData/verifyUser", {
                        title: "ยืนยันผู้ใช้",
                        emailS: "0",
                        email: "",
                        password: "",
                        rows: rows,
                    });
                }
              });
        }
    });

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
            dbCon.query("SELECT * FROM tb_user_verified WHERE user_id = "+id , (err, rows) => {
                if (err) {
                    req.flash("error", err);
                    res.redirect(req.get('referer'));
                } else {
                    dbCon.query("SELECT * FROM tb_point_user WHERE user_id = "+id , (err, rowspoint) => {
                        if (err) {
                            req.flash("error", "ไม่สามารถค้นหา tb_point_user");
                            res.redirect(req.get('referer'));
                        } else {
                            dbCon.query("SELECT * FROM tb_user WHERE id = "+ id , (err, rowsusetSTD) => {
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
                        emailS: "0",
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

module.exports = router;

