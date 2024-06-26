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
            //   "-" +
            //   file.originalname +
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


    // พอทย์ ทั้งหมดของระบบ
    router.get("/pointbase", function (req, res, next) {
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }else{
            dbCon.query("SELECT * FROM tb_point WHERE point_id = 1", (err, rows) => {
                if (err) {
                    req.flash("error", err);
                    res.render("adminData/pointbase", {
                        title: "จัดการพอทย์ระบบ",
                        username: req.session.userName,
                        emailS: req.session.emailUser,
                        levelS: req.session.level,
                        userImg: req.session.userImg,
                        point: "",
                    });
                } else {
                    res.render("adminData/pointbase", {
                        title: "จัดการพอทย์ระบบ",
                        username: req.session.userName,
                        emailS: req.session.emailUser,
                        levelS: req.session.level,
                        userImg: req.session.userImg,
                        point: rows,
                    });
                }
                });
        }
    });

    //เพิ่มพอทย์ระบบ -> ยืนยัน
    router.post("/pointbase/add", upload.single("photo"), (req, res, next) => {
        let pointUp = req.body.pointUp;

        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }else{
            dbCon.query("UPDATE tb_point SET point = point + ? WHERE point_id = ?" ,  [pointUp,1], (err, result) => {
                if (err) {
                    req.flash("error", err);
                    res.redirect(req.get('referer'));
                } else {
                    req.flash("success", 'เพิ่มพอทย์สำเร็จ : ' + pointUp );
                    res.redirect(req.get('referer'));
                }
            })
        }
    });

    // ประวัติ
    router.get("/history", function (req, res, next) {
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }else{
            // boardhealth
            dbCon.query("SELECT tb_user.username AS username,tb_boardhealth.title AS title,tb_boardhealth.created_at AS created_at ,tb_boardhealth.update_at AS update_at FROM tb_boardhealth LEFT JOIN tb_user ON tb_user.id = tb_boardhealth.user_id", (err, boardhealth) => {
                if (err) {
                    req.flash("error", err);
                    res.render("adminData/history", {
                        title: "ประวัติ",
                        username: req.session.userName,
                        emailS: req.session.emailUser,
                        levelS: req.session.level,
                        userImg: req.session.userImg,
                        boardhealth: "",
                        communityboard: "",
                        article: "",
                        shop: "",
                        add_point: "",
                        confirm_add_point: "",
                        boost: "",
                        out_point: "",
                        confirm_out_point: "",
                    });
                } else {
                    //article
                    dbCon.query("SELECT tb_user.username AS username,tb_article.title AS title,tb_article.created_at AS created_at ,tb_article.update_at AS update_at FROM tb_article LEFT JOIN tb_user ON tb_user.id = tb_article.user_id", (err, article) => {
                        if (err) {
                            req.flash("error", err);
                            res.render("adminData/history", {
                                title: "ประวัติ",
                                username: req.session.userName,
                                emailS: req.session.emailUser,
                                levelS: req.session.level,
                                userImg: req.session.userImg,
                                boardhealth: "",
                                communityboard: "",
                                article: "",
                                shop: "",
                                add_point: "",
                                confirm_add_point: "",
                                boost: "",
                                out_point: "",
                                confirm_out_point: "",
                            });
                        } else {
                            // add_point
                            dbCon.query("SELECT tb_user.username AS username, tb_add_point.name AS name, tb_add_point.photo AS photo,tb_add_point.date AS date,tb_add_point.time AS time,tb_add_point.status AS status,tb_add_point.created_at AS created_at ,tb_add_point.update_at AS update_at FROM tb_add_point LEFT JOIN tb_user ON tb_user.id = tb_add_point.user_id", (err, add_point) => {
                                if (err) {
                                    req.flash("error", err);
                                    res.render("adminData/history", {
                                        title: "ประวัติ",
                                        username: req.session.userName,
                                        emailS: req.session.emailUser,
                                        levelS: req.session.level,
                                        userImg: req.session.userImg,
                                        boardhealth: "",
                                        communityboard: "",
                                        article: "",
                                        shop: "",
                                        add_point: "",
                                        confirm_add_point: "",
                                        boost: "",
                                        out_point: "",
                                        confirm_out_point: "",
                                    });
                                } else {
                                    //confirm_add_point
                                    dbCon.query("SELECT tb_user.username AS username,tb_add_point.name AS name, tb_confirm_add_point.tb_confirm_add_point_id AS tb_confirm_add_point_id, tb_confirm_add_point.status AS status ,tb_confirm_add_point.created_at AS created_at ,tb_confirm_add_point.update_at AS update_at FROM tb_confirm_add_point LEFT JOIN tb_user ON tb_user.id = tb_confirm_add_point.admin_id LEFT JOIN tb_add_point ON tb_add_point.add_point_id = tb_confirm_add_point.add_point_id", (err, confirm_add_point) => {
                                        if (err) {
                                            req.flash("error", err);
                                            res.render("adminData/history", {
                                                title: "ประวัติ",
                                                username: req.session.userName,
                                                emailS: req.session.emailUser,
                                                levelS: req.session.level,
                                                userImg: req.session.userImg,
                                                boardhealth: "",
                                                communityboard: "",
                                                article: "",
                                                shop: "",
                                                add_point: "",
                                                confirm_add_point: "",
                                                boost: "",
                                                out_point: "",
                                                confirm_out_point: "",
                                            });
                                        } else {
                                            //boost
                        
                                            dbCon.query("SELECT tb_shop.title AS title,tb_boost.date_start AS date_start, tb_boost.date_end AS date_end, tb_boost.point AS point, tb_boost.numday AS numday, tb_boost.status AS status FROM tb_boost LEFT JOIN tb_shop ON tb_shop.shop_id = tb_boost.shop_id", (err, boost) => {
                                                if (err) {
                                                    req.flash("error", err);
                                                    res.render("adminData/history", {
                                                        title: "ประวัติ",
                                                        username: req.session.userName,
                                                        emailS: req.session.emailUser,
                                                        levelS: req.session.level,
                                                        userImg: req.session.userImg,
                                                        boardhealth: "",
                                                        communityboard: "",
                                                        article: "",
                                                        shop: "",
                                                        add_point: "",
                                                        confirm_add_point: "",
                                                        boost: "",
                                                        out_point: "",
                                                        confirm_out_point: "",
                                                    });
                                                } else {
                                                    //out_point
                                
                                                    dbCon.query("SELECT tb_user.username AS username,tb_out_point.bank AS bank, tb_out_point.account_number AS account_number, tb_out_point.name AS name, tb_out_point.money AS money, tb_out_point.status AS status FROM tb_out_point LEFT JOIN tb_user ON tb_user.id = tb_out_point.user_id", (err, out_point) => {
                                                        if (err) {
                                                            req.flash("error", err);
                                                            res.render("adminData/history", {
                                                                title: "ประวัติ",
                                                                username: req.session.userName,
                                                                emailS: req.session.emailUser,
                                                                levelS: req.session.level,
                                                                userImg: req.session.userImg,
                                                                boardhealth: "",
                                                                communityboard: "",
                                                                article: "",
                                                                shop: "",
                                                                add_point: "",
                                                                confirm_add_point: "",
                                                                boost: "",
                                                                out_point: "",
                                                                confirm_out_point: "",
                                                            });
                                                        } else {
                                                            //confirm_out_point
                                        
                                                            dbCon.query("SELECT tb_out_point.name AS name,tb_confirm_out_point.photo AS photo,tb_confirm_out_point.status AS status ,tb_confirm_out_point.created_at AS created_at ,tb_confirm_out_point.update_at AS update_at FROM tb_confirm_out_point LEFT JOIN tb_out_point ON tb_out_point.out_point_id = tb_confirm_out_point.out_point_id", (err, confirm_out_point) => {
                                                                if (err) {
                                                                    req.flash("error", err);
                                                                    res.render("adminData/history", {
                                                                        title: "ประวัติ",
                                                                        username: req.session.userName,
                                                                        emailS: req.session.emailUser,
                                                                        levelS: req.session.level,
                                                                        userImg: req.session.userImg,
                                                                        boardhealth: "",
                                                                        communityboard: "",
                                                                        article: "",
                                                                        shop: "",
                                                                        add_point: "",
                                                                        confirm_add_point: "",
                                                                        boost: "",
                                                                        out_point: "",
                                                                        confirm_out_point: "",
                                                                    });
                                                                } else {
                                                                    // shop
                                                                    dbCon.query("SELECT tb_user.username AS username,tb_shop.title AS title,tb_shop.created_at AS created_at ,tb_shop.update_at AS update_at FROM tb_shop LEFT JOIN tb_user ON tb_user.id = tb_shop.user_id", (err, shop) => {
                                                                        if (err) {
                                                                            req.flash("error", err);
                                                                            res.render("adminData/history", {
                                                                                title: "ประวัติ",
                                                                                username: req.session.userName,
                                                                                emailS: req.session.emailUser,
                                                                                levelS: req.session.level,
                                                                                userImg: req.session.userImg,
                                                                                boardhealth: "",
                                                                                communityboard: "",
                                                                                article: "",
                                                                                shop: "",
                                                                                add_point: "",
                                                                                confirm_add_point: "",
                                                                                boost: "",
                                                                                out_point: "",
                                                                                confirm_out_point: "",
                                                                            });
                                                                        } else {
                                                                            // communityboard
                                                                            dbCon.query("SELECT tb_user.username AS username,tb_communityboard.title AS title,tb_communityboard.created_at AS created_at ,tb_communityboard.update_at AS update_at FROM tb_communityboard LEFT JOIN tb_user ON tb_user.id = tb_communityboard.user_id", (err, communityboard) => {
                                                                                if (err) {
                                                                                    req.flash("error", err);
                                                                                    res.render("adminData/history", {
                                                                                        title: "ประวัติ",
                                                                                        username: req.session.userName,
                                                                                        emailS: req.session.emailUser,
                                                                                        levelS: req.session.level,
                                                                                        userImg: req.session.userImg,
                                                                                        boardhealth: "",
                                                                                        communityboard: "",
                                                                                        article: "",
                                                                                        shop: "",
                                                                                        add_point: "",
                                                                                        confirm_add_point: "",
                                                                                        boost: "",
                                                                                        out_point: "",
                                                                                        confirm_out_point: "",
                                                                                    });
                                                                                } else {
                                                                
                                                                                    res.render("adminData/history", {
                                                                                        title: "ประวัติ",
                                                                                        username: req.session.userName,
                                                                                        emailS: req.session.emailUser,
                                                                                        levelS: req.session.level,
                                                                                        userImg: req.session.userImg,
                                                                                        boardhealth: boardhealth,
                                                                                        communityboard: communityboard,
                                                                                        article: article,
                                                                                        shop: shop,
                                                                                        add_point: add_point,
                                                                                        confirm_add_point: confirm_add_point,
                                                                                        boost: boost,
                                                                                        out_point: out_point,
                                                                                        confirm_out_point: confirm_out_point,
                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });

    // ICON WEBSITE
    router.get("/icon", function (req, res, next) {
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }else{
            dbCon.query("SELECT * FROM tb_web_profile WHERE web_profile_id = ?",[1] , (err, rows) => {
                if (err) {
                    req.flash("error", err);
                    res.render("adminData/icon", {
                        title: "แก้ไข Logo",
                        username: req.session.userName,
                        emailS: req.session.emailUser,
                        levelS: req.session.level,
                        userImg: req.session.userImg,
                        photo: "",
                    });
                } else {
                    res.render("adminData/icon", {
                        title: "แก้ไข Logo",
                        username: req.session.userName,
                        emailS: req.session.emailUser,
                        levelS: req.session.level,
                        userImg: req.session.userImg,
                        photo: rows,
                    });
                }
                });
        }
    });

    //ICON WEBSITE -> ยืนยัน
    router.post("/icon/add", upload.single("photo"), (req, res, next) => {
        let photo = req.file.filename;
        let form_data = {
            icon: photo,
          };
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }else{
            dbCon.query("UPDATE tb_web_profile SET ? WHERE web_profile_id = ?" ,  [form_data,1], (err, result) => {
                if (err) {
                    req.flash("error", err);
                    res.redirect(req.get('referer'));
                } else {
                    req.flash("success", 'แก้ไขICONสำเร็จ : ' );
                    res.redirect(req.get('referer'));
                }
            })
        }
    });

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

    // เติมพอทย์ ->Delete
router.get("/confirmAddPoint/delete/(:id)", (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    let id = req.params.id;
    let errors = false;
  
    // if no error
    if (!errors) {
      let form_data = {
        status: 0,
      };

    dbCon.query("DELETE FROM tb_add_point WHERE add_point_id = ?", [id], (err, result) => {
        if (err) {
            req.flash("error", "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
            return console.log(err);
        } else {
          req.flash('success', 'ลบข้อมูลสำเร็จ');
          res.redirect(req.get('referer'));
        }
    })
    
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
                        });
                    }else {
                        req.flash('error', 'ระบบไม่เปิดใช้งานขณะนี้')
                        res.redirect(req.get('referer'));
                    }
                    
                }
            });
        }
    });

// ถอนพอทย์ ->Delete
router.get("/confirmOutPoint/delete/(:id)", (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    let id = req.params.id;
    let errors = false;
  
    // if no error
    if (!errors) {
      let form_data = {
        status: 0,
      };

    dbCon.query("DELETE FROM tb_out_point WHERE out_point_id = ?", [id], (err, result) => {
        if (err) {
            req.flash("error", "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
            return console.log(err);
        } else {
          req.flash('success', 'ลบข้อมูลสำเร็จ');
          res.redirect(req.get('referer'));
        }
    })
    
    }
});

//------------------------------------------------ ข้อมูลผู้ใช้ ----------------------------------------------------------------------------------------------------------------
// user
router.get("/user", function (req, res, next) {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }else{
        dbCon.query("SELECT * FROM tb_user ORDER BY id DESC;" , (err, rows) => {
            if (err) {
                req.flash("error", err);
                res.render("adminData/user", {
                    title: "จัดการ ผู้ใช้",
                    username: req.session.userName,
                    emailS: req.session.emailUser,
                    levelS: req.session.level,
                    userImg: req.session.userImg,
                    data: "",
                });
            } else {
                res.render("adminData/user", {
                    title: "จัดการ ผู้ใช้",
                    username: req.session.userName,
                    emailS: req.session.emailUser,
                    levelS: req.session.level,
                    userImg: req.session.userImg,
                    data: rows,
                });
            }
            });
    }
});

// user ->Edit 
router.post('/user/submit/(:id)', (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    let id = req.params.id;
    let username = req.body.username;
    let fname = req.body.fname;
    let sname = req.body.sname;
    let email = req.body.email;
    let level = req.body.level;
    let status = req.body.status;
    let errors = false;
    
    // if no error
    if (!errors) {
        let form_data = {
            username: username,
            fname: fname,
            sname: sname,
            email: email,
            level: level,
            status: status,
        }
        // update query
        dbCon.query("UPDATE tb_user SET ? WHERE	id = ?" ,[form_data,id], (err, result) => {
            if (err) {
                req.flash('error', "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
                res.redirect(req.get('referer'));
            } else {
                req.flash('success', 'แก้ไขข้อมูลผู้ใช้สำเร็จ');
                res.redirect(req.get('referer'));
            }
        })
    }
});

// user -> Edit Password
router.post('/userPassword/submit/(:id)', (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    let id = req.params.id;
    let password = req.body.password;
    let errors = false;
    
    // if no error
    if (!errors) {
        bcrypt.hash(password, 12, function (error, hash) {
          let form_data = {
            password: hash
          };

            // update query
            dbCon.query("UPDATE tb_user SET ? WHERE	id = ?" ,[form_data,id], (err, result) => {
                if (err) {
                    req.flash('error', "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
                    res.redirect(req.get('referer'));
                } else {
                    req.flash('success', 'แก้ไขรหัสผ่านผู้ใช้สำเร็จ');
                    res.redirect(req.get('referer'));
                }
            })
        });
      }
});

// user ->Edit IMG
router.post("/userIMG/submit/(:id)", upload.single("photo"), (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    
    let photo = req.file.filename;
    let id = req.params.id;
    let errors = false;
    
    // if no error
    if (!errors) {
        let form_data = {
        img: photo,
        };
        // insert query
        dbCon.query("UPDATE tb_user SET ? WHERE id = ?" ,[form_data,id], (err, result) => {
        if (err) {
            req.flash('error', "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
            res.redirect(req.get('referer'));
        } else {
            req.flash('success', 'แก้ไขรูปผู้ใช้สำเร็จ');
            res.redirect(req.get('referer'));
        }
    })
    }
});

// user ->Delete
router.get("/userDelete/submit/(:id)", (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    let id = req.params.id;
    let errors = false;
  
    // if no error
    if (!errors) {
      let form_data = {
        status: 0,
      };

    // dbCon.query("DELETE FROM tb_user WHERE id = ?", [id], (err, result) => {
    //     if (err) {
    //         req.flash("error", "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
    //         return console.log(err);
    //     } else {
    //       req.flash('success', 'ลบข้อมูลผู้ใช้สำเร็จ');
    //       res.redirect(req.get('referer'));
    //     }
    // })
    
    // insert query
    dbCon.query("UPDATE tb_user SET ? WHERE id = ?" ,[form_data,id], (err, result) => {
        if (err) {
            req.flash('error', "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
            res.redirect(req.get('referer'));
        } else {
            req.flash('success', 'ลบข้อมูลผู้ใช้สำเร็จ');
            res.redirect(req.get('referer'));
        }
    })
    }
});

//------------------------------------------------ ปิดข้อมูลผู้ใช้ ----------------------------------------------------------------------------------------------------------------

//------------------------------------------------ ข้อมูลผู้ใช้เพิ่มเติม ----------------------------------------------------------------------------------------------------------------
// userData1
router.get("/userData1", function (req, res, next) {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }else{
        dbCon.query("SELECT tb_user.username AS username, tb_user_data_1.* FROM tb_user_data_1 LEFT JOIN tb_user ON tb_user_data_1.user_id = tb_user.id ORDER BY id DESC;" , (err, rows) => {
            if (err) {
                req.flash("error", err);
                res.render("adminData/userData1", {
                    title: "จัดการ ข้อมูลผู้ใช้เพิ่มเติม",
                    username: req.session.userName,
                    emailS: req.session.emailUser,
                    levelS: req.session.level,
                    userImg: req.session.userImg,
                    data: "",
                });
            } else {
                res.render("adminData/userData1", {
                    title: "จัดการ ข้อมูลผู้ใช้เพิ่มเติม",
                    username: req.session.userName,
                    emailS: req.session.emailUser,
                    levelS: req.session.level,
                    userImg: req.session.userImg,
                    data: rows,
                });
            }
            });
    }
});

// userData1 ->Edit 
router.post('/userData1/submit/(:id)', (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    let id = req.params.id;
    let gender = req.body.gender;
    let Birthday = req.body.Birthday;
    let status = req.body.status;
    let errors = false;
    
    // if no error
    if (!errors) {
        let form_data = {
            gender: gender,
            Birthday: Birthday,
            status: status,
        }
        // update query
        dbCon.query("UPDATE tb_user_data_1 SET ? WHERE user_data_1_id = ?" ,[form_data,id], (err, result) => {
            if (err) {
                req.flash('error', "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
                res.redirect(req.get('referer'));
            } else {
                req.flash('success', 'แก้ไขข้อมูลผู้ใช้เพิ่มเติมสำเร็จ');
                res.redirect(req.get('referer'));
            }
        })
    }
});

// userData1 ->Delete
router.get("/userData1Delete/submit/(:id)", (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    let id = req.params.id;
    let errors = false;
  
    // if no error
    if (!errors) {
      let form_data = {
        status: 0,
      };

    dbCon.query("DELETE FROM tb_user_data_1 WHERE user_data_1_id = ?", [id], (err, result) => {
        if (err) {
            req.flash("error", "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
            return console.log(err);
        } else {
          req.flash('success', 'ลบข้อมูลผู้ใช้เพิ่มเติมสำเร็จ');
          res.redirect(req.get('referer'));
        }
    })
    
    // insert query
    // dbCon.query("UPDATE tb_user_data_1 SET ? WHERE user_data_1_id = ?" ,[form_data,id], (err, result) => {
    //     if (err) {
    //         req.flash('error', err);
    //         res.redirect(req.get('referer'));
    //     } else {
    //         req.flash('success', 'ลบข้อมูลผู้ใช้สำเร็จ');
    //         res.redirect(req.get('referer'));
    //     }
    // })
    }
});
//------------------------------------------------ ปิดข้อมูลผู้ใช้เพิ่มเติม ----------------------------------------------------------------------------------------------------------------

//------------------------------------------------ ข้อมูลสุนัข ----------------------------------------------------------------------------------------------------------------
// dog
router.get("/dog", function (req, res, next) {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }else{
        dbCon.query("SELECT tb_user.username AS username, tb_dog.* FROM tb_dog LEFT JOIN tb_user ON tb_dog.user_id = tb_user.id ORDER BY id DESC;" , (err, rows) => {
            if (err) {
                req.flash("error", err);
                res.render("adminData/dog", {
                    title: "จัดการ สุนัข",
                    username: req.session.userName,
                    emailS: req.session.emailUser,
                    levelS: req.session.level,
                    userImg: req.session.userImg,
                    data: "",
                });
            } else {
                res.render("adminData/dog", {
                    title: "จัดการ สุนัข",
                    username: req.session.userName,
                    emailS: req.session.emailUser,
                    levelS: req.session.level,
                    userImg: req.session.userImg,
                    data: rows,
                });
            }
            });
    }
});

// dog ->Edit 
router.post('/dog/submit/(:id)', (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    let id = req.params.id;
    let dog_name = req.body.dog_name;
    let dog_breed = req.body.dog_breed;
    let dog_birthday = req.body.dog_birthday;
    let dog_gender = req.body.dog_gender;
    let status = req.body.status;
    let errors = false;
    
    // if no error
    if (!errors) {
        let form_data = {
            dog_name: dog_name,
            dog_breed: dog_breed,
            dog_birthday: dog_birthday,
            dog_gender: dog_gender,
            status: status,
        }
        // update query
        dbCon.query("UPDATE tb_dog SET ? WHERE	id = ?" ,[form_data,id], (err, result) => {
            if (err) {
                req.flash('error', "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
                res.redirect(req.get('referer'));
            } else {
                req.flash('success', 'แก้ไขข้อมูลสุนัขสำเร็จ');
                res.redirect(req.get('referer'));
            }
        })
    }
});

// dog ->Edit IMG
router.post("/dogIMG/submit/(:id)", upload.single("photo"), (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    
    let photo = req.file.filename;
    let id = req.params.id;
    let errors = false;
    
    // if no error
    if (!errors) {
        let form_data = {
            dog_img: photo,
        };
        // insert query
        dbCon.query("UPDATE tb_dog SET ? WHERE id = ?" ,[form_data,id], (err, result) => {
        if (err) {
            req.flash('error', "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
            res.redirect(req.get('referer'));
        } else {
            req.flash('success', 'แก้ไขรูปสุนัขสำเร็จ');
            res.redirect(req.get('referer'));
        }
    })
    }
});

// dog ->Delete
router.get("/dogDelete/submit/(:id)", (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    let id = req.params.id;
    let errors = false;
  
    // if no error
    if (!errors) {
      let form_data = {
        status: 0,
      };

    // dbCon.query("DELETE FROM tb_user WHERE id = ?", [id], (err, result) => {
    //     if (err) {
    //         req.flash("error", "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
    //         return console.log(err);
    //     } else {
    //       req.flash('success', 'ลบข้อมูลผู้ใช้สำเร็จ');
    //       res.redirect(req.get('referer'));
    //     }
    // })
    
    // insert query
    dbCon.query("UPDATE tb_user SET ? WHERE id = ?" ,[form_data,id], (err, result) => {
        if (err) {
            req.flash('error', "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
            res.redirect(req.get('referer'));
        } else {
            req.flash('success', 'ลบข้อมูลสุนัขสำเร็จ');
            res.redirect(req.get('referer'));
        }
    })
    }
});

//------------------------------------------------ ปิดข้อมูลสุนัข ----------------------------------------------------------------------------------------------------------------


//------------------------------------------------ ข้อมูลร้านค้า ----------------------------------------------------------------------------------------------------------------
// userShop
router.get("/userShop", function (req, res, next) {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }else{
        dbCon.query("SELECT tb_user.username AS username, tb_user_shop.* FROM tb_user_shop LEFT JOIN tb_user ON tb_user_shop.user_id = tb_user.id ORDER BY id DESC;" , (err, rows) => {
            if (err) {
                req.flash("error", err);
                res.render("adminData/userShop", {
                    title: "จัดการ โปรไฟล์ร้าค้า",
                    username: req.session.userName,
                    emailS: req.session.emailUser,
                    levelS: req.session.level,
                    userImg: req.session.userImg,
                    data: "",
                });
            } else {
                res.render("adminData/userShop", {
                    title: "จัดการ โปรไฟล์ร้าค้า",
                    username: req.session.userName,
                    emailS: req.session.emailUser,
                    levelS: req.session.level,
                    userImg: req.session.userImg,
                    data: rows,
                });
            }
            });
    }
});

// userShop ->Edit 
router.post('/userShop/submit/(:id)', (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    let id = req.params.id;
    let shop_name = req.body.shop_name;
    let shop_type = req.body.shop_type;
    let shop_introduce = req.body.shop_introduce;
    let shop_tel = req.body.shop_tel;
    let shop_shopee = req.body.shop_shopee;
    let shop_facebook = req.body.shop_facebook;
    let shop_line = req.body.shop_line;
    let shop_address = req.body.shop_address;
    let status = req.body.status;
    let errors = false;
    
    // if no error
    if (!errors) {
        let form_data = {
            shop_name: shop_name,
            shop_type: shop_type,
            shop_introduce: shop_introduce,
            shop_tel: shop_tel,
            shop_shopee: shop_shopee,
            shop_facebook: shop_facebook,
            shop_line: shop_line,
            shop_address: shop_address,
            status: status,
        }
        // update query
        dbCon.query("UPDATE tb_user_shop SET ? WHERE	id = ?" ,[form_data,id], (err, result) => {
            if (err) {
                req.flash('error', "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
                res.redirect(req.get('referer'));
            } else {
                req.flash('success', 'แก้ไขข้อมูลร้านค้าสำเร็จ');
                res.redirect(req.get('referer'));
            }
        })
    }
});

// userShop ->Edit IMG
router.post("/userShopIMG/submit/(:id)", upload.single("photo"), (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    
    let photo = req.file.filename;
    let id = req.params.id;
    let errors = false;
    
    // if no error
    if (!errors) {
        let form_data = {
            shop_img: photo,
        };
        // insert query
        dbCon.query("UPDATE tb_user_shop SET ? WHERE id = ?" ,[form_data,id], (err, result) => {
        if (err) {
            req.flash('error', "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
            res.redirect(req.get('referer'));
        } else {
            req.flash('success', 'แก้ไขรูปร้านค้าสำเร็จ');
            res.redirect(req.get('referer'));
        }
    })
    }
});

// userShop ->Delete
router.get("/userShopDelete/submit/(:id)", (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    let id = req.params.id;
    let errors = false;
  
    // if no error
    if (!errors) {
      let form_data = {
        status: 0,
      };

    // dbCon.query("DELETE FROM tb_user_shop WHERE id = ?", [id], (err, result) => {
    //     if (err) {
    //         req.flash("error", "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
    //         return console.log(err);
    //     } else {
    //       req.flash('success', 'ลบข้อมูลร้านค้าสำเร็จ');
    //       res.redirect(req.get('referer'));
    //     }
    // })
    
    // insert query
    dbCon.query("UPDATE tb_user_shop SET ? WHERE id = ?" ,[form_data,id], (err, result) => {
        if (err) {
            req.flash('error', "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
            res.redirect(req.get('referer'));
        } else {
            req.flash('success', 'ลบข้อมูลร้านค้าสำเร็จ');
            res.redirect(req.get('referer'));
        }
    })
    }
});

//------------------------------------------------ ปิดข้อมูลร้านค้า ----------------------------------------------------------------------------------------------------------------

//------------------------------------------------ ข้อมูลผู้ใช้ที่ผ่านการยืนยันแล้ว ----------------------------------------------------------------------------------------------------------------
// userVerify
router.get("/userVerify", function (req, res, next) {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }else{
        dbCon.query("SELECT tb_user.username AS username, tb_user_verified.* FROM tb_user_verified LEFT JOIN tb_user ON tb_user_verified.user_id = tb_user.id ORDER BY id DESC;" , (err, rows) => {
            if (err) {
                req.flash("error", err);
                res.render("adminData/userVerify", {
                    title: "จัดการ ผู้ใช้ที่ผ่านการยืนยันแล้ว",
                    username: req.session.userName,
                    emailS: req.session.emailUser,
                    levelS: req.session.level,
                    userImg: req.session.userImg,
                    data: "",
                });
            } else {
                res.render("adminData/userVerify", {
                    title: "จัดการ ผู้ใช้ที่ผ่านการยืนยันแล้ว",
                    username: req.session.userName,
                    emailS: req.session.emailUser,
                    levelS: req.session.level,
                    userImg: req.session.userImg,
                    data: rows,
                });
            }
            });
    }
});

// userVerify ->Edit 
router.post('/userVerify/submit/(:id)', (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    let id = req.params.id;
    let address = req.body.address;
    let card_id = req.body.card_id;
    let tel = req.body.tel;
    let facebook = req.body.facebook;
    let line = req.body.line;
    let status = req.body.status;
    let errors = false;
    
    // if no error
    if (!errors) {
        let form_data = {
            address: address,
            card_id: card_id,
            tel: tel,
            facebook: facebook,
            line: line,
            status: status,
        }
        // update query
        dbCon.query("UPDATE tb_user_verified SET ? WHERE id = ?" ,[form_data,id], (err, result) => {
            if (err) {
                req.flash('error', "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
                res.redirect(req.get('referer'));
            } else {
                req.flash('success', 'แก้ไขผู้ใช้ที่ผ่านการยืนยันแล้วสำเร็จ');
                res.redirect(req.get('referer'));
            }
        })
    }
});

// userVerify ->Delete
router.get("/userVerifyDelete/submit/(:id)", (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    let id = req.params.id;
    let errors = false;
  
    // if no error
    if (!errors) {
      let form_data = {
        status: 0,
      };

    dbCon.query("DELETE FROM tb_user_verified WHERE id = ?", [id], (err, result) => {
        if (err) {
            req.flash("error", "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
            return console.log(err);
        } else {
          req.flash('success', 'ลบข้อมูลผู้ใช้ที่ผ่านการยืนยันแล้วสำเร็จ');
          res.redirect(req.get('referer'));
        }
    })
    
    // insert query
    // dbCon.query("UPDATE tb_user SET ? WHERE id = ?" ,[form_data,id], (err, result) => {
    //     if (err) {
    //         req.flash('error', err);
    //         res.redirect(req.get('referer'));
    //     } else {
    //         req.flash('success', 'ลบข้อมูลผู้ใช้สำเร็จ');
    //         res.redirect(req.get('referer'));
    //     }
    // })
    }
});
//------------------------------------------------ ปิดข้อมูลผู้ใช้ที่ผ่านการยืนยันแล้ว ----------------------------------------------------------------------------------------------------------------

//------------------------------------------------ ข้อมูลผู้เชี่ยวชาญ ----------------------------------------------------------------------------------------------------------------
// userVets
router.get("/userVets", function (req, res, next) {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }else{
        dbCon.query("SELECT tb_user.username AS username, tb_vets.* FROM tb_vets LEFT JOIN tb_user ON tb_vets.user_id = tb_user.id ORDER BY id DESC;" , (err, rows) => {
            if (err) {
                req.flash("error", err);
                res.render("adminData/userVets", {
                    title: "จัดการ ผู้เชี่ยวชาญ",
                    username: req.session.userName,
                    emailS: req.session.emailUser,
                    levelS: req.session.level,
                    userImg: req.session.userImg,
                    data: "",
                });
            } else {
                res.render("adminData/userVets", {
                    title: "จัดการ ผู้เชี่ยวชาญ",
                    username: req.session.userName,
                    emailS: req.session.emailUser,
                    levelS: req.session.level,
                    userImg: req.session.userImg,
                    data: rows,
                });
            }
            });
    }
});


// userVets ->Edit 
router.post('/userVets/submit/(:id)', (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    let id = req.params.id;
    let vets_title = req.body.vets_title;
    let vets_fname = req.body.vets_fname;
    let vets_sname = req.body.vets_sname;
    let vets_email = req.body.vets_email;
    let vets_name_show = req.body.vets_name_show;
    let vets_gender = req.body.vets_gender;
    let vets_birthday = req.body.vets_birthday;
    let vets_address = req.body.vets_address;
    let vets_tel = req.body.vets_tel;
    let vets_facebook = req.body.vets_facebook;
    let vets_line = req.body.vets_line;
    let vets_workplace = req.body.vets_workplace;
    let vets_position = req.body.vets_position;
    let vets_graduated = req.body.vets_graduated;
    let vets_introduce = req.body.vets_introduce;
    let status = req.body.status;
    let errors = false;
    
    // if no error
    if (!errors) {
        let form_data = {
            vets_title: vets_title,
            vets_fname: vets_fname,
            vets_sname: vets_sname,
            vets_email: vets_email,
            vets_name_show: vets_name_show,
            vets_gender: vets_gender,
            vets_birthday: vets_birthday,
            vets_address: vets_address,
            vets_tel: vets_tel,
            vets_facebook: vets_facebook,
            vets_line: vets_line,
            vets_workplace: vets_workplace,
            vets_position: vets_position,
            vets_graduated: vets_graduated,
            vets_introduce: vets_introduce,
            status: status,
        }
        // update query
        dbCon.query("UPDATE tb_vets SET ? WHERE id = ?" ,[form_data,id], (err, result) => {
            if (err) {
                req.flash('error', "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
                res.redirect(req.get('referer'));
            } else {
                req.flash('success', 'แก้ไขผู้เชี่ยวชาญสำเร็จ');
                res.redirect(req.get('referer'));
            }
        })
    }
});

// userVets ->Edit vetsLicense
router.post("/vetsLicense/submit/(:id)", upload.single("photo"), (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    
    let photo = req.file.filename;
    let id = req.params.id;
    let errors = false;
    
    // if no error
    if (!errors) {
        let form_data = {
            vets_license: photo,
        };
        // insert query
        dbCon.query("UPDATE tb_vets SET ? WHERE id = ?" ,[form_data,id], (err, result) => {
        if (err) {
            req.flash('error', "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
            res.redirect(req.get('referer'));
        } else {
            req.flash('success', 'แก้ไขใบอนุญาตสำเร็จ');
            res.redirect(req.get('referer'));
        }
    })
    }
});

// userVets ->Edit vetsIMG
router.post("/vetsIMG/submit/(:id)", upload.single("photo"), (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    
    let photo = req.file.filename;
    let id = req.params.id;
    let errors = false;
    
    // if no error
    if (!errors) {
        let form_data = {
            vets_img: photo,
        };
        // insert query
        dbCon.query("UPDATE tb_vets SET ? WHERE id = ?" ,[form_data,id], (err, result) => {
        if (err) {
            req.flash('error', "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
            res.redirect(req.get('referer'));
        } else {
            req.flash('success', 'แก้ไขใบอนุญาตสำเร็จ');
            res.redirect(req.get('referer'));
        }
    })
    }
});

// userVets ->Delete
router.get("/userVetsDelete/submit/(:id)", (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    let id = req.params.id;
    let errors = false;
  
    // if no error
    if (!errors) {
      let form_data = {
        status: 0,
      };

    dbCon.query("DELETE FROM tb_vets WHERE id = ?", [id], (err, result) => {
        if (err) {
            req.flash("error", "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
            return console.log(err);
        } else {
          req.flash('success', 'ลบข้อมูลผู้เชียวชาญสำเร็จ');
          res.redirect(req.get('referer'));
        }
    })
    
    // insert query
    // dbCon.query("UPDATE tb_user SET ? WHERE id = ?" ,[form_data,id], (err, result) => {
    //     if (err) {
    //         req.flash('error', err);
    //         res.redirect(req.get('referer'));
    //     } else {
    //         req.flash('success', 'ลบข้อมูลผู้ใช้สำเร็จ');
    //         res.redirect(req.get('referer'));
    //     }
    // })
    }
});
//------------------------------------------------ ข้อมูลผู้เชี่ยวชาญ ----------------------------------------------------------------------------------------------------------------


//------------------------------------------------ จัดการ ----------------------------------------------------------------------------------------------------------------
    // boardhealth
    router.get("/boardhealth", function (req, res, next) {
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }else{
            dbCon.query("SELECT tb_boardhealth.boardhealth_id,tb_boardhealth.title,tb_boardhealth.photo,tb_boardhealth.details,tb_boardhealth.status,tb_boardhealth.view,tb_boardhealth.created_at,tb_boardhealth.update_at, tb_user.username FROM tb_boardhealth INNER JOIN tb_user ON tb_boardhealth.user_id = tb_user.id ORDER BY boardhealth_id DESC" , (err, rows) => {
                if (err) {
                    req.flash("error", err);
                    res.render("adminData/boardhealth", {
                        title: "จัดการ บอร์ดสุขภาพสุนัข",
                        username: req.session.userName,
                        emailS: req.session.emailUser,
                        levelS: req.session.level,
                        userImg: req.session.userImg,
                        data: "",
                    });
                } else {
                    res.render("adminData/boardhealth", {
                        title: "จัดการ บอร์ดสุขภาพสุนัข",
                        username: req.session.userName,
                        emailS: req.session.emailUser,
                        levelS: req.session.level,
                        userImg: req.session.userImg,
                        data: rows,
                    });
                }
                });
        }
    });

    // boardhealth ->Edit 
    router.post('/boardhealth/submit/(:id)', (req, res, next) => {
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }
        let id = req.params.id;
        let titleboard = req.body.titleboard;
        let details = req.body.details;
        let errors = false;
      
        // if no error
        if (!errors) {
            let form_data = {
              title: titleboard,
              details: details
            }
            // update query
            dbCon.query("UPDATE tb_boardhealth SET ? WHERE	boardhealth_id = ?" ,[form_data,id], (err, result) => {
                if (err) {
                    req.flash('error', err);
                    res.redirect(req.get('referer'));
                } else {
                    req.flash('success', 'แก้ไขสำเร็จ');
                    res.redirect(req.get('referer'));
                }
            })
        }
    })

    // boardhealth ->Edit IMG
    router.post("/boardhealthIMG/submit/(:id)", upload.single("photo"), (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    
    let photo = req.file.filename;
    let id = req.params.id;
    let errors = false;
    
    // if no error
    if (!errors) {
        let form_data = {
        photo: photo,
        };
        // insert query
        dbCon.query("UPDATE tb_boardhealth SET ? WHERE boardhealth_id = ?" ,[form_data,id], (err, result) => {
        if (err) {
            req.flash('error', err);
            res.redirect(req.get('referer'));
        } else {
            req.flash('success', 'แก้ไขสำเร็จ');
            res.redirect(req.get('referer'));
        }
    })
    }
    });

    // boardhealth ->Delete
    router.get("/boardhealthDelete/submit/(:id)", (req, res, next) => {
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }
        let id = req.params.id;
        let errors = false;
      
        // if no error
        if (!errors) {
          let form_data = {
            status: 0,
          };
          // insert query
          dbCon.query("UPDATE tb_boardhealth SET ? WHERE boardhealth_id = ?" ,[form_data,id], (err, result) => {
            if (err) {
                req.flash('error', err);
                res.redirect('/admin/boardhealth');
            } else {
                req.flash('success', 'ลบบอร์ดสุขภาพสำเร็จ');
                res.redirect('/admin/boardhealth');
            }
        })
        }
      });

          // article
    router.get("/article", function (req, res, next) {
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }else{
            dbCon.query("SELECT tb_article.article_id,tb_article.title,tb_article.photo,tb_article.details,tb_article.status,tb_article.view,tb_article.created_at,tb_article.update_at,tb_user.username,tb_user.img FROM tb_article INNER JOIN tb_user ON tb_article.user_id = tb_user.id ORDER BY article_id DESC" , (err, rows) => {
                if (err) {
                    req.flash("error", err);
                    res.render("adminData/article", {
                        title: "จัดการ บทความชุมชน",
                        username: req.session.userName,
                        emailS: req.session.emailUser,
                        levelS: req.session.level,
                        userImg: req.session.userImg,
                        data: "",
                    });
                } else {
                    res.render("adminData/article", {
                        title: "จัดการ บทความชุมชน",
                        username: req.session.userName,
                        emailS: req.session.emailUser,
                        levelS: req.session.level,
                        userImg: req.session.userImg,
                        data: rows,
                    });
                }
                });
        }
    });

    // article ->Edit 
    router.post('/article/submit/(:id)', (req, res, next) => {
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }
        let id = req.params.id;
        let titleboard = req.body.titleboard;
        let details = req.body.details;
        let errors = false;
      
        // if no error
        if (!errors) {
            let form_data = {
              title: titleboard,
              details: details
            }
            // update query
            dbCon.query("UPDATE tb_article SET ? WHERE	article_id = ?" ,[form_data,id], (err, result) => {
                if (err) {
                    req.flash('error', err);
                    res.redirect(req.get('referer'));
                } else {
                    req.flash('success', 'แก้ไขสำเร็จ');
                    res.redirect(req.get('referer'));
                }
            })
        }
      })

    // article ->Edit IMG
    router.post("/articleIMG/submit/(:id)", upload.single("photo"), (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    
    let photo = req.file.filename;
    let id = req.params.id;
    let errors = false;
    
    // if no error
    if (!errors) {
        let form_data = {
        photo: photo,
        };
        // insert query
        dbCon.query("UPDATE tb_article SET ? WHERE article_id = ?" ,[form_data,id], (err, result) => {
        if (err) {
            req.flash('error', err);
            res.redirect(req.get('referer'));
        } else {
            req.flash('success', 'แก้ไขสำเร็จ');
            res.redirect(req.get('referer'));
        }
    })
    }
    });

    // article ->Delete
    router.get("/articleDelete/submit/(:id)", (req, res, next) => {
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }
        let id = req.params.id;
        let errors = false;
      
        // if no error
        if (!errors) {
          let form_data = {
            status: 0,
          };
          // insert query
          dbCon.query("UPDATE tb_article SET ? WHERE article_id = ?" ,[form_data,id], (err, result) => {
            if (err) {
                req.flash('error', err);
                res.redirect('/admin/article');
            } else {
                req.flash('success', 'ลบบทความชุมชนสำเร็จ');
                res.redirect('/admin/article');
            }
        })
        }
      });

    // board
    router.get("/board", function (req, res, next) {
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }else{
            dbCon.query("SELECT tb_communityboard.communityboard_id,tb_communityboard.title,tb_communityboard.photo,tb_communityboard.details,tb_communityboard.status,tb_communityboard.view,tb_communityboard.created_at,tb_communityboard.update_at,tb_user.username,tb_user.img FROM tb_communityboard INNER JOIN tb_user ON tb_communityboard.user_id = tb_user.id ORDER BY communityboard_id DESC" , (err, rows) => {
                if (err) {
                    req.flash("error", err);
                    res.render("adminData/board", {
                        title: "จัดการ บอร์ดชุมชน",
                        username: req.session.userName,
                        emailS: req.session.emailUser,
                        levelS: req.session.level,
                        userImg: req.session.userImg,
                        data: "",
                    });
                } else {
                    res.render("adminData/board", {
                        title: "จัดการ บอร์ดชุมชน",
                        username: req.session.userName,
                        emailS: req.session.emailUser,
                        levelS: req.session.level,
                        userImg: req.session.userImg,
                        data: rows,
                    });
                }
                });
        }
    });

    // board ->Edit 
    router.post('/board/submit/(:id)', (req, res, next) => {
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }
        let id = req.params.id;
        let titleboard = req.body.titleboard;
        let details = req.body.details;
        let errors = false;
      
        // if no error
        if (!errors) {
            let form_data = {
              title: titleboard,
              details: details
            }
            // update query
            dbCon.query("UPDATE tb_communityboard SET ? WHERE	communityboard_id = ?" ,[form_data,id], (err, result) => {
                if (err) {
                    req.flash('error', err);
                    res.redirect(req.get('referer'));
                } else {
                    req.flash('success', 'แก้ไขสำเร็จ');
                    res.redirect(req.get('referer'));
                }
            })
        }
      })

    // board ->Edit IMG
    router.post("/boardIMG/submit/(:id)", upload.single("photo"), (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    
    let photo = req.file.filename;
    let id = req.params.id;
    let errors = false;
    
    // if no error
    if (!errors) {
        let form_data = {
        photo: photo,
        };
        // insert query
        dbCon.query("UPDATE tb_communityboard SET ? WHERE communityboard_id = ?" ,[form_data,id], (err, result) => {
        if (err) {
            req.flash('error', err);
            res.redirect(req.get('referer'));
        } else {
            req.flash('success', 'แก้ไขสำเร็จ');
            res.redirect(req.get('referer'));
        }
    })
    }
    });

    // board ->Delete
    router.get("/boardDelete/submit/(:id)", (req, res, next) => {
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }
        let id = req.params.id;
        let errors = false;
      
        // if no error
        if (!errors) {
          let form_data = {
            status: 0,
          };
          // insert query
          dbCon.query("UPDATE tb_communityboard SET ? WHERE communityboard_id = ?" ,[form_data,id], (err, result) => {
            if (err) {
                req.flash('error', err);
                res.redirect('/admin/board');
            } else {
                req.flash('success', 'ลบบอร์ดชุมชนสำเร็จ');
                res.redirect('/admin/board');
            }
        })
        }
      });

    // shop
    router.get("/shop", function (req, res, next) {
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }else{
            dbCon.query("SELECT tb_shop.shop_id,tb_shop.title,tb_shop.photo,tb_shop.details,tb_shop.status,tb_shop.boost,tb_shop.view,tb_shop.created_at,tb_shop.update_at, tb_user.username, tb_user_shop.shop_name FROM tb_shop LEFT JOIN tb_user ON tb_shop.user_id = tb_user.id LEFT JOIN tb_user_shop ON tb_shop.user_id = tb_user_shop.user_id ORDER BY boost DESC , shop_id DESC" , (err, rows) => {
                if (err) {
                    req.flash("error", err);
                    res.render("adminData/shop", {
                        title: "จัดการ ร้านค้าโฆษณา",
                        username: req.session.userName,
                        emailS: req.session.emailUser,
                        levelS: req.session.level,
                        userImg: req.session.userImg,
                        data: "",
                    });
                } else {
                    res.render("adminData/shop", {
                        title: "จัดการ ร้านค้าโฆษณา",
                        username: req.session.userName,
                        emailS: req.session.emailUser,
                        levelS: req.session.level,
                        userImg: req.session.userImg,
                        data: rows,
                    });
                }
                });
        }
    });

    // shop ->Edit 
    router.post('/shop/submit/(:id)', (req, res, next) => {
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }
        let id = req.params.id;
        let titleboard = req.body.titleboard;
        let details = req.body.details;
        let errors = false;
      
        // if no error
        if (!errors) {
            let form_data = {
              title: titleboard,
              details: details
            }
            // update query
            dbCon.query("UPDATE tb_shop SET ? WHERE	shop_id = ?" ,[form_data,id], (err, result) => {
                if (err) {
                    req.flash('error', err);
                    res.redirect(req.get('referer'));
                } else {
                    req.flash('success', 'แก้ไขสำเร็จ');
                    res.redirect(req.get('referer'));
                }
            })
        }
      })

    // shop ->Edit IMG
    router.post("/shopIMG/submit/(:id)", upload.single("photo"), (req, res, next) => {
    if (!req.session.ifNotLogIn ||  req.session.level < 4) {
        res.render("adminData/login", {
            title: "login",
            email: "",
            password: "",
        });
    }
    
    let photo = req.file.filename;
    let id = req.params.id;
    let errors = false;
    
    // if no error
    if (!errors) {
        let form_data = {
        photo: photo,
        };
        // insert query
        dbCon.query("UPDATE tb_shop SET ? WHERE shop_id = ?" ,[form_data,id], (err, result) => {
        if (err) {
            req.flash('error', err);
            res.redirect(req.get('referer'));
        } else {
            req.flash('success', 'แก้ไขสำเร็จ');
            res.redirect(req.get('referer'));
        }
    })
    }
    });

    // shop ->Delete
    router.get("/shopDelete/submit/(:id)", (req, res, next) => {
        if (!req.session.ifNotLogIn ||  req.session.level < 4) {
            res.render("adminData/login", {
                title: "login",
                email: "",
                password: "",
            });
        }
        let id = req.params.id;
        let errors = false;
      
        // if no error
        if (!errors) {
          let form_data = {
            status: 0,
          };
          // insert query
          dbCon.query("UPDATE tb_shop SET ? WHERE shop_id = ?" ,[form_data,id], (err, result) => {
            if (err) {
                req.flash('error', err);
                res.redirect('/admin/shop');
            } else {
                req.flash('success', 'ลบบอร์ดชุมชนสำเร็จ');
                res.redirect('/admin/shop');
            }
        })
        }
      });
//------------------------------------------------ จัดการ ปิด ----------------------------------------------------------------------------------------------------------------



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
                            res.redirect(req.get('referer'));
                            // res.redirect("../");
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


