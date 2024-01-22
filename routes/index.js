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
    userImg: req.session.userImg,
  });
});


/* -------------------------------------------------------------- ข้อมูลผู้ใช้ ------------------------------------------------------------------------------------------------------ */

router.get("/userInformation", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.render("index", {
      title: "Home",
      username: "0",
      emailS: "0",
      levelS: 0,
    });
  }
  dbCon.query(
    "SELECT tb_user.img AS img,tb_user.username AS username,tb_user.fname AS fname,tb_user.sname AS lname,tb_user.email AS email,tb_gender.name AS gender,tb_user_data_1.Birthday AS birthday FROM tb_user LEFT JOIN tb_user_data_1 ON tb_user.id = tb_user_data_1.user_id LEFT JOIN tb_gender ON tb_user_data_1.gender = tb_gender.gender_id WHERE tb_user.id = ?",[req.session.idUser],
    (err, rows) => {
      if (err) {
        console.log(err);
        req.flash("error", err);
        res.render("userInformation", {
          title: "User Information",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
          username2: "",
          fname: "",
          lname: "",
          email: "",
          gender: "",
          birthday: "",
          rowsVerified: "",
          rowsShop: "",
          rowsDog: "",
          rowsVets: "",
        });      
      } else {
        dbCon.query(
          "SELECT * FROM tb_user_verified WHERE user_id = ?" ,[req.session.idUser],
          (err, rowsVerified) => {
            if (err) {
              req.flash("error", err);
              res.redirect('/')
            } else {
              dbCon.query(
                "SELECT * FROM tb_user_shop WHERE user_id = ?",[req.session.idUser],
                (err, rowsShop) => {
                  if (err) {
                    req.flash("error", err);
                    res.redirect('/')
                  } else {
                    dbCon.query(
                      "SELECT * FROM tb_dog LEFT JOIN tb_gender ON tb_dog.dog_gender = tb_gender.gender_id WHERE user_id = ?",[req.session.idUser],
                      (err, rowsDog) => {
                        if (err) {
                          req.flash("error", err);
                          res.redirect('/')
                        } else {
                          dbCon.query(
                            "SELECT * FROM tb_vets LEFT JOIN tb_gender ON tb_vets.vets_gender = tb_gender.gender_id WHERE user_id = ?",[req.session.idUser],
                            (err, rowsVets) => {
                              console.log(rowsVets);
                              if (err) {
                                req.flash("error", err);
                                res.redirect('/')
                              } else {
                                return res.render("userInformation", {
                                  title: "User Information",
                                  username: req.session.userName,
                                  emailS: req.session.emailUser,
                                  levelS: req.session.level,
                                  userImg: req.session.userImg,
                                  img: rows[0].img,
                                  username2: rows[0].username,
                                  fname: rows[0].fname,
                                  lname: rows[0].lname,
                                  email: rows[0].email,
                                  gender: rows[0].gender,
                                  birthday: rows[0].birthday,
                                  rowsVerified: rowsVerified,
                                  rowsShop: rowsShop,
                                  rowsDog: rowsDog,
                                  rowsVets: rowsVets,
                                });    
                                
                                  
                              }
                            }
                          );      
                            
                        }
                      }
                    );  
                      
                  }
                }
              );  

            }
          }
        );

      }
    }
  );
});

/* -------------------------------------------------------------- ข้อมูลผู้ใช้ - แก้ไขรูปโปรไฟล์ ------------------------------------------------------------------------------------------------------ */
router.get("/editProfile", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.render("index", {
      title: "Home",
      username: "0",
      emailS: "0",
      levelS: 0,
    });
  }
  dbCon.query(
    "SELECT tb_user.img AS img FROM tb_user WHERE tb_user.id = ?",[req.session.idUser],
    (err, rows) => {
      if (err) {
        req.flash("error", err);
        res.render("editProfile", {
          title: "Edit Profile",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
          img: rows[0].img,
        });      
      } else {
        res.render("editProfile", {
          title: "Edit Profile",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
          img: rows[0].img,
        });      
      }
    }
  );
});

// add a แก้ไข รูปโปรไฟล์
router.post("/editProfileSubmit", upload.single("photo"), (req, res, next) => {
  let photo = req.file.filename;
  let errors = false;

  // if no error
  if (!errors) {
    let form_data = {
      img: photo,
    };
    // insert query
    dbCon.query(
      "UPDATE tb_user SET ? WHERE id = ?",[req.session.idUser, form_data],
      (err, result) => {
        if (err) {
          req.flash("error", err);
          res.redirect("/userInformation");
        } else {
          dbCon.query(
            "SELECT * FROM tb_user WHERE id = ?",[req.session.idUser],
            async (err, rows) => {
              if (err) {
                req.flash("error", err);
                res.redirect("/userInformation");
              } else {
                req.session.userImg = rows[0].img;
                req.flash("success", "แก้ไขรูปโปรไฟล์สำเร็จ");
                res.redirect("/userInformation");
              }
            }
          );
        }
      }
    );
  }
});

/* -------------------------------------------------------------- ข้อมูลผู้ใช้ - แก้ไขข้อมูลสมาชิก ------------------------------------------------------------------------------------------------------ */
router.get("/editUserData1", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.render("index", {
      title: "Home",
      username: "0",
      emailS: "0",
      levelS: 0,
    });
  }
  dbCon.query(
    "SELECT tb_user.img AS img,tb_user.username AS username,tb_user.fname AS fname,tb_user.sname AS lname,tb_user.email AS email,tb_gender.name AS gender,tb_user_data_1.gender AS gender_num,tb_user_data_1.Birthday AS birthday FROM tb_user LEFT JOIN tb_user_data_1 ON tb_user.id = tb_user_data_1.user_id LEFT JOIN tb_gender ON tb_user_data_1.gender = tb_gender.gender_id WHERE tb_user.id = ?",[req.session.idUser],
    (err, rows) => {
      if (err) {
        req.flash("error", err);
        res.render("editUserData1", {
          title: "แก้ไขข้อมูลผู้ใช้",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
          username2: "",
          fname: "",
          lname: "",
          email: "",
          gender: "",
          gender_num: "",
          birthday: "",
        });      
      } else {
        res.render("editUserData1", {
          title: "User Information",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
          img: rows[0].img,
          username2: rows[0].username,
          fname: rows[0].fname,
          lname: rows[0].lname,
          email: rows[0].email,
          gender: rows[0].gender,
          gender_num: rows[0].gender_num,
          birthday: rows[0].birthday,
        });      
      }
    }
  );
});

// add a แก้ไข ข้อมูลสมาชิก
router.post("/editUserData1Submit", (req, res, next) => {
  let username2 = req.body.username;
  let fname = req.body.fname;
  let lname = req.body.lname;
  let email = req.body.email;
  let gender_num = req.body.genders;
  let birthday = req.body.birthday;
  let errors = false;
  
  // if no error
  if (!errors) {
    let form_data1 = {
      username: username2,
      fname: fname,
      sname: lname,
      email: email
    }
    let form_data2 = {
        user_id: req.session.idUser,
        gender: gender_num,
        Birthday: birthday
    }
    let form_data3 = {
      user_id: req.session.idUser,
      gender: gender_num,
      Birthday: birthday,
      status: 1
  }
    dbCon.query(
      "SELECT * FROM tb_user_data_1 WHERE user_id = ?",[req.session.idUser],
      (err, rows) => {
        if (err) {
          console.log("ERRO 1");
          req.flash('error', err);
          res.redirect('/userInformation')
        } else {
          // มีข้อมูลอยู่แล้ว
          if (rows.length == 1) {
            // update query
            dbCon.query("UPDATE tb_user_data_1 SET ? WHERE user_id = ?" [form_data2,req.session.idUser], (err, result) => {
              if (err) {
                  console.log("ERRO 2");
                  req.flash('error', err);
                  res.redirect('/userInformation')
              } else {
                dbCon.query("UPDATE tb_user SET ? WHERE id = ?",[form_data1,req.session.idUser], (err, result) => {
                  if (err) {
                      console.log("ERRO 3");
                      req.flash('error', err);
                      res.redirect('/userInformation')
                  } else {
                    dbCon.query(
                      "SELECT * FROM tb_user WHERE id = ?" [req.session.idUser],
                      async (err, rows3) => {
                        if (err) {
                          req.flash("error", err);
                          console.log("ERRO 4");
                          res.redirect("/userInformation");
                        } else {
                          req.session.emailUser = rows3[0].email;
                          req.session.userName = rows3[0].username;
                          req.flash('success', 'แก้ไขข้อมูลสำเร็จ');
                          res.redirect('/userInformation')
                        }
                      }
                    );
                  }
                })
              }
            })
          }
          else{
            //ยังไม่มีข้อมูล
            // update query
            dbCon.query("INSERT INTO tb_user_data_1 SET ?", form_data3, (err, result) => {
              if (err) {
                  console.log("ERRO 2/");
                  req.flash('error', err);
                  res.redirect('/userInformation')
              } else {
                dbCon.query("UPDATE tb_user SET ? WHERE id = ?",[req.session.idUser,form_data1], (err, result) => {
                  if (err) {
                      console.log("ERRO 3/");
                      req.flash('error', err);
                      res.redirect('/userInformation')
                  } else {
                    dbCon.query(
                      "SELECT * FROM tb_user WHERE id = ?",[req.session.idUser],
                      async (err, rows3) => {
                        if (err) {
                          req.flash("error", err);
                          console.log("ERRO 4/");
                          res.redirect("/userInformation");
                        } else {
                          req.session.emailUser = rows3[0].email;
                          req.session.userName = rows3[0].username;
                          req.flash('success', 'แก้ไขข้อมูลสำเร็จ');
                          res.redirect('/userInformation')
                        }
                      }
                    );
                  }
                })
              }
            })
          }
          
        }
      }
    );
  }
});

/* -------------------------------------------------------------- ข้อมูลผู้ใช้ - ส่งข้อมูลยืนยันผู้ใช้ ------------------------------------------------------------------------------------------------------ */
router.get("/userVerified", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.redirect('/')
  }
  if (req.session.level > 1) {
    return res.redirect('/')
  }
  res.render("userVerified", {
    title: "ส่งข้อมูลยืนยันผู้ใช้",
    username: req.session.userName,
    emailS: req.session.emailUser,
    levelS: req.session.level,
    userImg: req.session.userImg,
    id_card: "",
    address: "",
    tel: "",
    facebook: "",
    line: "",
  }); 
});

// add a แก้ไข ข้อมูลสมาชิก
router.post("/userVerifiedSubmit", (req, res, next) => {
  let id_card = req.body.id_card;
  let address = req.body.address;
  let tel = req.body.tel;
  let facebook = req.body.facebook;
  let line = req.body.line;
  let errors = false;
  
  // if no error
  if (!errors) {
    let form_data = {
        user_id: req.session.idUser,
        card_id: id_card,
        address: address,
        tel: tel,
        facebook: facebook,
        line: line,
        status: 0
    }
    // insert query
    dbCon.query("INSERT INTO tb_user_verified SET ?", form_data, (err, result) => {
      if (err) {
          console.log("ERRO 2/");
          req.flash('error', err);
          res.redirect('/userInformation')
      } else {
        req.flash('success', 'ส่งข้อมูลยืนยันสำเร็จ โปรดรอการตอบกลับในอีเมล');
        res.redirect('/userInformation')
      }
    })
  }
});

/* -------------------------------------------------------------- ข้อมูลผู้ใช้ - แก้ไขข้อมูลยืนยันผู้ใช้ ------------------------------------------------------------------------------------------------------ */
router.get("/editUserVerified", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.render("index", {
      title: "Home",
      username: "0",
      emailS: "0",
      levelS: 0,
    });
  }
  dbCon.query(
    "SELECT * FROM tb_user_verified WHERE user_id = ?",[req.session.idUser],
    (err, rows) => {
      if (err) {
        req.flash("error", err);
        res.render("editUserVerified", {
          title: "แก้ไขข้อมูลยืนยันผู้ใช้",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
          id_card: "",
          address: "",
          tel: "",
          facebook: "",
          line: "",
        });      
      } else {
        res.render("editUserVerified", {
          title: "แก้ไขข้อมูลยืนยันผู้ใช้",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
          id_card: rows[0].	card_id,
          address: rows[0].address,
          tel: rows[0].tel,
          facebook: rows[0].facebook,
          line: rows[0].line,
        });
      }
    }
  );
});

// add a แก้ไข แก้ไขข้อมูลยืนยันผู้ใช้
router.post("/editUserVerifiedSubmit", (req, res, next) => {
  let address = req.body.address;
  let tel = req.body.tel;
  let facebook = req.body.facebook;
  let line = req.body.line;
  let errors = false;
  
  // if no error
  if (!errors) {
    let form_data1 = {
      address: address,
      tel: tel,
      facebook: facebook,
      line: line
    }
    dbCon.query("UPDATE tb_user_verified SET ? WHERE user_id = ?",[form_data1,req.session.idUser], (err, result) => {
      if (err) {
          console.log("ERRO 3");
          req.flash('error', err);
          res.redirect('/userInformation')
      } else {
        req.flash('success', 'แก้ไขข้อมูลสำเร็จ');
        res.redirect('/userInformation')
      }
    })
  }
});

/* -------------------------------------------------------------- ข้อมูลผู้ใช้ - เพิ่มข้อมูลสุนัข ------------------------------------------------------------------------------------------------------ */
router.get("/dogAdd", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.redirect('/')
  }
  if (req.session.level < 2) {
    return res.redirect('/')
  }
  res.render("dogAdd", {
    title: "เพิ่มข้อมูลสุนัข",
    username: req.session.userName,
    emailS: req.session.emailUser,
    levelS: req.session.level,
    userImg: req.session.userImg,
    id_card: "",
    address: "",
    tel: "",
    facebook: "",
    line: "",
  }); 
});

// add a แก้ไข ข้อมูลสมาชิก
router.post("/dogAddSubmit", upload.single("photo"), (req, res, next) => {
  let photo = req.file.filename;
  let dogName = req.body.dogName;
  let dogBreed = req.body.dogBreed;
  let dogBirthday = req.body.dogBirthday;
  let dogGender = req.body.dogGender;
  let dogIntroduce = req.body.dogIntroduce;
  let errors = false;
  
  // if no error
  if (!errors) {
    let form_data = {
        user_id: req.session.idUser,
        dog_name: dogName,
        dog_breed: dogBreed,
        dog_gender: dogGender,
        dog_birthday: dogBirthday,
        dog_introduce	: dogIntroduce,
        dog_img	: photo,
        status: 1
    }
    // insert query
    dbCon.query("INSERT INTO tb_dog SET ?", form_data, (err, result) => {
      if (err) {
          console.log("ERRO");
          req.flash('error', err);
          res.redirect('/userInformation')
      } else {
        req.flash('success', 'เพิ่มข้อมูลสุนัขสำเร็จ');
        res.redirect('/userInformation')
      }
    })
  }
});

/* -------------------------------------------------------------- ข้อมูลผู้ใช้ - แก้ไขรูปโปรไฟล์สุนัข ------------------------------------------------------------------------------------------------------ */
router.get("/editDogProfile", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.redirect("/");
  }
  if (req.session.level < 2) {
    return res.redirect('/')
  }
  dbCon.query(
    "SELECT tb_dog.dog_img AS img FROM tb_dog WHERE user_id = ?",[req.session.idUser],
    (err, rows) => {
      if (err) {
        req.flash("error", err);
        res.redirect('/userInformation');  
      } else {
        if (rows.length == 0) {
          req.flash("ไม่พบข้อมูล", err);
          console.log(rows.length);
          res.redirect("/userInformation");
        }else{
          res.render("editDogProfile", {
            title: "Edit Dog Profile",
            username: req.session.userName,
            emailS: req.session.emailUser,
            levelS: req.session.level,
            userImg: req.session.userImg,
            img: rows[0].img,
          });      
        }
      }
    }
  );
});

// add a แก้ไข รูปโปรไฟล์สุนัข
router.post("/editDogProfileSubmit", upload.single("photo"), (req, res, next) => {
  let photo = req.file.filename;
  let errors = false;

  // if no error
  if (!errors) {
    let form_data = {
      dog_img: photo,
    };
    // insert query
    dbCon.query(
      "UPDATE tb_dog SET ? WHERE user_id = ?",[req.session.idUser, form_data],
      (err, result) => {
        if (err) {
          req.flash("error", err);
          res.redirect("/userInformation");
        } else {
          req.flash("success", "แก้ไขรูปโปรไฟล์สำเร็จ");
          res.redirect("/userInformation");
        }
      }
    );
  }
});

/* -------------------------------------------------------------- ข้อมูลผู้ใช้ - แก้ไขข้อมูลสุนัข ------------------------------------------------------------------------------------------------------ */
router.get("/editDogData", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.render("index", {
      title: "Home",
      username: "0",
      emailS: "0",
      levelS: 0,
    });
  }
  if (req.session.level < 2) {
    return res.redirect('/')
  }
  dbCon.query(
    "SELECT * FROM tb_dog LEFT JOIN tb_gender ON tb_dog.dog_gender = tb_gender.gender_id WHERE user_id = ?",[req.session.idUser],
    (err, rows) => {
      if (err) {
        req.flash("error", err);
        res.render("editDogData", {
          title: "แก้ไขข้อมูลสุนัข",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
          dogName: "",
          dogBreed: "",
          dogBirthday: "",
          dogGender: "",
          dogGenderName: "",
          dogIntroduce: "",
        });      
      } else {
        if (rows.length == 0) {
          req.flash("ไม่พบข้อมูล", err);
          console.log(rows.length);
          res.redirect("/userInformation");
        }else{
          res.render("editDogData", {
            title: "แก้ไขข้อมูลสุนัข",
            username: req.session.userName,
            emailS: req.session.emailUser,
            levelS: req.session.level,
            userImg: req.session.userImg,
            dogName: rows[0].dog_name,
            dogBreed: rows[0].dog_breed,
            dogBirthday: rows[0].dog_birthday,
            dogGender: rows[0].dog_gender,
            dogGenderName: rows[0].name,
            dogIntroduce: rows[0].dog_introduce,
          });
        }
        
      }
    }
  );
});

// add a แก้ไข ข้อมูลสมาชิก
router.post("/editDogDataSubmit", (req, res, next) => {
  let dogName = req.body.dogName;
  let dogBreed = req.body.dogBreed;
  let dogBirthday = req.body.dogBirthday;
  let dogGender = req.body.dogGender;
  let dogIntroduce = req.body.dogIntroduce;
  let errors = false;
  
  // if no error
  if (!errors) {
    let form_data1 = {
      dog_name: dogName,
      dog_breed: dogBreed,
      dog_birthday: dogBirthday,
      dog_gender: dogGender,
      dog_introduce: dogIntroduce
    }
    dbCon.query("UPDATE tb_dog SET ? WHERE user_id = ?",[form_data1,req.session.idUser], (err, result) => {
      if (err) {
          console.log("ERRO 3");
          req.flash('error', err);
          res.redirect('/userInformation')
      } else {
        req.flash('success', 'แก้ไขข้อมูลสำเร็จ');
        res.redirect('/userInformation')
      }
    })
  }
});

/* -------------------------------------------------------------- ข้อมูลผู้ใช้ - เพิ่มข้อมูลร้าน ------------------------------------------------------------------------------------------------------ */
router.get("/shopAdd", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.redirect('/')
  }
  if (req.session.level < 2) {
    return res.redirect('/')
  }
  res.render("shopAdd", {
    title: "เพิ่มข้อมูลร้าน",
    username: req.session.userName,
    emailS: req.session.emailUser,
    levelS: req.session.level,
    userImg: req.session.userImg,
    shopName: "",
    shopType: "",
    shopIntroduce: "",
    shopTel: "",
    shopShopee: "",
    shopFacebook: "",
    shopLine: "",
    shopAddress: "",
  }); 
});

// add  ข้อมูลร้าน
router.post("/shopAddSubmit", upload.single("photo"), (req, res, next) => {
  let photo = req.file.filename;
  let shopName = req.body.shopName;
  let shopType = req.body.shopType;
  let shopIntroduce = req.body.shopIntroduce;
  let shopTel = req.body.shopTel;
  let shopShopee = req.body.shopShopee;
  let shopFacebook = req.body.shopFacebook;
  let shopLine = req.body.shopLine;
  let shopAddress = req.body.shopAddress;
  let errors = false;
  
  // if no error
  if (!errors) {
    let form_data = {
        user_id: req.session.idUser,
        shop_name: shopName,
        shop_type: shopType,
        shop_introduce: shopIntroduce,
        shop_tel: shopTel,
        shop_shopee	: shopShopee,
        shop_facebook	: shopFacebook,
        shop_line	: shopLine,
        shop_address	: shopAddress,
        shop_img	: photo,
        status: 1
    }
    // insert query
    dbCon.query("INSERT INTO tb_user_shop SET ?", form_data, (err, result) => {
      if (err) {
          console.log("ERRO");
          req.flash('error', err);
          res.redirect('/userInformation')
      } else {
        req.flash('success', 'เพิ่มข้อมูลร้านค้าสำเร็จ');
        res.redirect('/userInformation')
      }
    })
  }
});

/* -------------------------------------------------------------- ข้อมูลผู้ใช้ - แก้ไขรูปโปรไฟล์ลร้าน ------------------------------------------------------------------------------------------------------ */
router.get("/editShopProfile", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.redirect("/");
  }
  if (req.session.level < 2) {
    return res.redirect('/')
  }
  dbCon.query(
    "SELECT tb_user_shop.shop_img AS img FROM tb_user_shop WHERE user_id = ?",[req.session.idUser],
    (err, rows) => {
      if (err) {
        req.flash("error", err);
        res.redirect('/userInformation');
      } else {
        if (rows.length == 0) {
          req.flash("ไม่พบข้อมูล", err);
          console.log(rows.length);
          res.redirect("/userInformation");
        }else{
          res.render("editShopProfile", {
            title: "Edit Shop Profile",
            username: req.session.userName,
            emailS: req.session.emailUser,
            levelS: req.session.level,
            userImg: req.session.userImg,
            img: rows[0].img,
          });  
        }
            
      }
    }
  );
});

// add a แก้ไข รูปโปรไฟล์สุนัข
router.post("/editShopProfileSubmit", upload.single("photo"), (req, res, next) => {
  let photo = req.file.filename;
  let errors = false;

  // if no error
  if (!errors) {
    let form_data = {
      shop_img: photo,
    };
    // insert query
    dbCon.query(
      "UPDATE tb_user_shop SET ? WHERE user_id = ?",[form_data,req.session.idUser],
      (err, result) => {
        if (err) {
          req.flash("error", err);
          res.redirect("/userInformation");
        } else {
          req.flash("success", "แก้ไขรูปโปรไฟล์ร้านค้าสำเร็จ");
          res.redirect("/userInformation");
        }
      }
    );
  }
});

/* -------------------------------------------------------------- ข้อมูลผู้ใช้ - แก้ไขข้อมูลร้าน ------------------------------------------------------------------------------------------------------ */
router.get("/editshopData", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.render("index", {
      title: "Home",
      username: "0",
      emailS: "0",
      levelS: 0,
    });
  }

  if (req.session.level < 2) {
    return res.redirect('/')
  }
  dbCon.query(
    "SELECT * FROM tb_user_shop WHERE user_id = ?",[req.session.idUser],
    (err, rows) => {
      if (err) {
        req.flash("error", err);
        res.render("editshopData", {
          title: "แก้ไขข้อมูลร้านค้า",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
          shopName: "",
          shopType: "",
          shopIntroduce: "",
          shopTel: "",
          shopShopee: "",
          shopFacebook: "",
          shopLine: "",
          shopAddress: "",
        });      
      } else {
        if (rows.length == 0) {
          req.flash("ไม่พบข้อมูล", err);
          console.log(rows.length);
          res.redirect("/userInformation");
        }else{
          res.render("editshopData", {
            title: "แก้ไขข้อมูลร้านค้า",
            username: req.session.userName,
            emailS: req.session.emailUser,
            levelS: req.session.level,
            userImg: req.session.userImg,
            shopName: rows[0].shop_name,
            shopType: rows[0].shop_type,
            shopIntroduce: rows[0].shop_introduce,
            shopTel: rows[0].shop_tel,
            shopShopee: rows[0].shop_shopee,
            shopFacebook: rows[0].shop_facebook,
            shopLine: rows[0].shop_line,
            shopAddress: rows[0].shop_address,
          });
        }
      }
    }
  );
});

// add a แก้ไข ข้อมูลสมาชิก
router.post("/editshopDataSubmit", (req, res, next) => {
  let shopName = req.body.shopName;
  let shopType = req.body.shopType;
  let shopIntroduce = req.body.shopIntroduce;
  let shopTel = req.body.shopTel;
  let shopShopee = req.body.shopShopee;
  let shopFacebook = req.body.shopFacebook;
  let shopLine = req.body.shopLine;
  let shopAddress = req.body.shopAddress;
  let errors = false;
  
  // if no error
  if (!errors) {
    let form_data1 = {
      user_id: req.session.idUser,
      shop_name: shopName,
      shop_type: shopType,
      shop_introduce: shopIntroduce,
      shop_tel: shopTel,
      shop_shopee	: shopShopee,
      shop_facebook	: shopFacebook,
      shop_line	: shopLine,
      shop_address	: shopAddress,
    }
    dbCon.query("UPDATE tb_user_shop SET ? WHERE user_id = ?",[form_data1,req.session.idUser], (err, result) => {
      if (err) {
          console.log("ERRO 3");
          req.flash('error', err);
          res.redirect('/userInformation')
      } else {
        req.flash('success', 'แก้ไขข้อมูลร้านสำเร็จ');
        res.redirect('/userInformation')
      }
    })
  }
});



/* -------------------------------------------------------------- ข้อมูลผู้ใช้ - ส่งข้อมูลยืนยันผู้เชี่ยวชาญ ------------------------------------------------------------------------------------------------------ */
router.get("/userVets", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.redirect('/')
  }
  if (req.session.level > 2) {
    return res.redirect('/')
  }
  res.render("userVets", {
    title: "ส่งข้อมูลยืนยันผู้เชี่ยวชาญ",
    username: req.session.userName,
    emailS: req.session.emailUser,
    levelS: req.session.level,
    userImg: req.session.userImg,
    vetsTitle: "",
    vetsFname: "",
    vetsSname: "",
    vetsEmail: "",
    vetsNameShow: "",
    vetsGender: "",
    vetsBirthday: "",
    vetsAddress: "",
    vetsCardId: "",
    vetsTel: "",
    vetsFacebook: "",
    vetsLine: "",
    vetsWorkplace: "",
    vetsPosition: "",
    vetsGraduated: "",
    vetsIntroduce: "",
  }); 
});

// add
router.post("/userVetsSubmit", upload.single("photo"), (req, res, next) => {
  let photo = req.file.filename;
  let vetsTitle = req.body.vetsTitle;
  let  vetsFname = req.body.vetsFname;
  let  vetsSname = req.body.vetsSname;
  let  vetsEmail = req.body.vetsEmail;
  let  vetsNameShow = req.body.vetsNameShow;
  let  vetsGender = req.body.vetsGender;
  let  vetsBirthday = req.body.vetsBirthday;
  let  vetsAddress = req.body.vetsAddress;
  let  vetsCardId = req.body.vetsCardId;
  let  vetsTel = req.body.vetsTel;
  let  vetsFacebook = req.body.vetsFacebook;
  let  vetsLine = req.body.vetsLine;
  let  vetsWorkplace = req.body.vetsWorkplace;
  let  vetsPosition = req.body.vetsPosition;
  let  vetsGraduated = req.body.vetsGraduated;
  let  vetsIntroduce = req.body.vetsIntroduce;
  let errors = false;
  
  // if no error
  if (!errors) {
    let form_data = {
        user_id: req.session.idUser,
        vets_title: vetsTitle,
        vets_fname: vetsFname,
        vets_sname: vetsSname,
        vets_email: vetsEmail,
        vets_name_show: vetsNameShow,
        vets_gender: vetsGender,
        vets_birthday: vetsBirthday,
        vets_address: vetsAddress,
        vets_card_id: vetsCardId,
        vets_tel: vetsTel,
        vets_facebook: vetsFacebook,
        vets_line: vetsLine,
        vets_workplace: vetsWorkplace,
        vets_position: vetsPosition,
        vets_graduated: vetsGraduated,
        vets_introduce: vetsIntroduce,
        vets_img: photo,
        status: 0
    }
    // insert query
    dbCon.query("INSERT INTO tb_vets SET ?", form_data, (err, result) => {
      if (err) {
          console.log("ERRO 2/");
          req.flash('error', err);
          res.redirect('/userInformation')
      } else {
        req.flash('success', 'ส่งข้อมูลยืนยันผู้เชี่ยวชาญสำเร็จ โปรดรอการตอบกลับในอีเมล');
        res.redirect('/userInformation')
      }
    })
  }
});

/* -------------------------------------------------------------- ข้อมูลผู้ใช้ - แก้ไขรูปโปรไฟล์ผู้เชี่ยวชาญ ------------------------------------------------------------------------------------------------------ */
router.get("/editUserVetsProfile", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.redirect("/");
  }
  if (req.session.level < 3) {
    return res.redirect('/')
  }
  dbCon.query(
    "SELECT tb_vets.vets_img AS img FROM tb_vets WHERE user_id = ?",[req.session.idUser],
    (err, rows) => {
      if (err) {
        req.flash("error", err);
        res.redirect('/userInformation');
      } else {
        res.render("editUserVetsProfile", {
          title: "Edit UserVets Profile",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
          img: rows[0].img,
        });      
      }
    }
  );
});

// add a แก้ไข รูปโปรไฟล์
router.post("/editUserVetsProfileSubmit", upload.single("photo"), (req, res, next) => {
  let photo = req.file.filename;
  let errors = false;

  // if no error
  if (!errors) {
    let form_data = {
      vets_img: photo,
    };
    // insert query
    dbCon.query(
      "UPDATE tb_vets SET ? WHERE user_id = ?",[form_data,req.session.idUser],
      (err, result) => {
        if (err) {
          req.flash("error", err);
          res.redirect("/userInformation");
        } else {
          req.flash("success", "แก้ไขรูปโปรไฟล์ผู้เชี่ยวชาญสำเร็จ");
          res.redirect("/userInformation");
        }
      }
    );
  }
});

/* -------------------------------------------------------------- ข้อมูลผู้ใช้ - แก้ไขข้อมูลผู้เชี่ยวชาญ ------------------------------------------------------------------------------------------------------ */
router.get("/editUserVetsData", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.render("index", {
      title: "Home",
      username: "0",
      emailS: "0",
      levelS: 0,
    });
  }
  if (req.session.level < 3) {
    return res.redirect('/')
  }
  dbCon.query(
    "SELECT * FROM tb_vets LEFT JOIN tb_gender ON tb_vets.vets_gender = tb_gender.gender_id WHERE user_id = ?",[req.session.idUser],
    (err, rows) => {
      if (err) {
        req.flash("error", err);
        res.render("editUserVetsData", {
          title: "แก้ไขข้อมูลผู้เชี่ยวชาญ",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
          vetsTitle: "",
          vetsFname: "",
          vetsSname: "",
          vetsEmail: "",
          vetsNameShow: "",
          vetsGender: "",
          vetsGenderName: "",
          vetsBirthday: "",
          vetsAddress: "",
          vetsCardId: "",
          vetsTel: "",
          vetsFacebook: "",
          vetsLine: "",
          vetsWorkplace: "",
          vetsPosition: "",
          vetsGraduated: "",
          vetsIntroduce: "",
        });      
      } else {
        res.render("editUserVetsData", {
          title: "แก้ไขข้อมูลผู้เชี่ยวชาญ",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
          vetsTitle: rows[0].vets_title,
          vetsFname: rows[0].vets_fname,
          vetsSname: rows[0].vets_sname,
          vetsEmail: rows[0].vets_email,
          vetsNameShow: rows[0].vets_name_show,
          vetsGender: rows[0].vets_gender,
          vetsGenderName: rows[0].name,
          vetsBirthday: rows[0].vets_birthday,
          vetsAddress: rows[0].vets_address,
          vetsCardId: rows[0].vets_card_id,
          vetsTel: rows[0].vets_tel,
          vetsFacebook: rows[0].vets_facebook,
          vetsLine: rows[0].vets_line,
          vetsWorkplace: rows[0].vets_workplace,
          vetsPosition: rows[0].vets_position,
          vetsGraduated: rows[0].vets_graduated,
          vetsIntroduce: rows[0].vets_introduce,
        });
      }
    }
  );
});

// add
router.post("/editUserVetsDataSubmit", (req, res, next) => {
  let vetsTitle = req.body.vetsTitle;
  let vetsFname = req.body.vetsFname;
  let vetsSname = req.body.vetsSname;
  let vetsEmail = req.body.vetsEmail;
  let vetsNameShow = req.body.vetsNameShow;
  let vetsGender = req.body.vetsGender;
  let vetsBirthday = req.body.vetsBirthday;
  let vetsAddress = req.body.vetsAddress;
  let vetsCardId = req.body.vetsCardId;
  let vetsTel = req.body.vetsTel;
  let vetsFacebook = req.body.vetsFacebook;
  let vetsLine = req.body.vetsLine;
  let vetsWorkplace = req.body.vetsWorkplace;
  let vetsPosition = req.body.vetsPosition;
  let vetsGraduated = req.body.vetsGraduated;
  let vetsIntroduce = req.body.vetsIntroduce;
  let errors = false;
  
  // if no error
  if (!errors) {
    let form_data1 = {
      vets_title: vetsTitle,
      vets_fname: vetsFname,
      vets_sname: vetsSname,
      vets_email: vetsEmail,
      vets_name_show: vetsNameShow,
      vets_gender: vetsGender,
      vets_birthday: vetsBirthday,
      vets_address: vetsAddress,
      vets_card_id: vetsCardId,
      vets_tel: vetsTel,
      vets_facebook: vetsFacebook,
      vets_line: vetsLine,
      vets_workplace: vetsWorkplace,
      vets_position: vetsPosition,
      vets_graduated: vetsGraduated,
      vets_introduce: vetsIntroduce,
    }
    dbCon.query("UPDATE tb_vets SET ? WHERE user_id = ?",[form_data1,req.session.idUser], (err, result) => {
      if (err) {
          console.log("ERRO 3");
          req.flash('error', err);
          res.redirect('/userInformation')
      } else {
        req.flash('success', 'แก้ไขข้อมูลผู้เชี่ยวชาญสำเร็จ');
        res.redirect('/userInformation')
      }
    })
  }
});


/* -------------------------------------------------------------- หน้าบอร์ดสุขภาพสุนัข ------------------------------------------------------------------------------------------------------ */

/* GET boardhealth page. */
router.get("/boardhealth", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return dbCon.query(
      "SELECT tb_boardhealth.boardhealth_id,tb_boardhealth.title,tb_boardhealth.photo,tb_boardhealth.details,tb_boardhealth.status,tb_boardhealth.view,tb_boardhealth.created_at,tb_boardhealth.update_at, tb_user.username FROM tb_boardhealth INNER JOIN tb_user ON tb_boardhealth.user_id = tb_user.id ORDER BY boardhealth_id DESC",
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
    "SELECT tb_boardhealth.boardhealth_id,tb_boardhealth.title,tb_boardhealth.photo,tb_boardhealth.details,tb_boardhealth.status,tb_boardhealth.view,tb_boardhealth.created_at,tb_boardhealth.update_at, tb_user.username FROM tb_boardhealth INNER JOIN tb_user ON tb_boardhealth.user_id = tb_user.id ORDER BY boardhealth_id DESC",
    (err, rows) => {
      if (err) {
        req.flash("error", err);
        res.render("boardhealth", {
          title: "Board Health",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
          data: "",
        });
      } else {
        res.render("boardhealth", {
          title: "Board Health",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
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
  }
  res.render("boardhealthAdd", {
    title: "สร้างกระทู้ Board Health",
    username: req.session.userName,
    emailS: req.session.emailUser,
    levelS: req.session.level,
    userImg: req.session.userImg,
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
      userImg: req.session.userImg,
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
            userImg: req.session.userImg,
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
      "SELECT * FROM tb_boardhealth WHERE boardhealth_id = ?",[id],
      (err, rows, fields) => {
        if (rows.length <= 0) {
          req.flash("error", "ไม่พบกระทู้ = " + id);
          res.redirect("/boardhealth");
        } else {
          dbCon.query(
            "SELECT * FROM tb_user WHERE id = ?",[rows[0].user_id],
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
                  userImg: req.session.userImg,
                  id: rows[0].boardhealth_id,
                  titletext: rows[0].title,
                  photo: rows[0].photo,
                  details: rows[0].details,
                  createdP: rows[0].created_at,
                  namehead: rows2[0].username,
                  imghead: rows2[0].img,
                  view: rows[0].view,
                });
              }
            }
          );
        }
      }
    );
  }
  dbCon.query("SELECT * FROM tb_boardhealth WHERE boardhealth_id = ?",[id],(err, rows, fields) => {
      if (rows.length <= 0) {
        req.flash("error", "ไม่พบกระทู้ = " + id);
        res.redirect("/boardhealth");
      } else {
        dbCon.query(
          "SELECT * FROM tb_user WHERE id = ?",[rows[0].user_id],(err, rows2, fields) => {
            if (rows2.length <= 0) {
              req.flash("error", "ไม่พบกระทู้ = " + id);
              res.redirect("/boardhealth");
            } else {
              res.render("boardhealthDetail", {
                title: "รายละเอียดบอร์ดสุขภาพสุนัข",
                username: req.session.userName,
                emailS: req.session.emailUser,
                levelS: req.session.level,
                userImg: req.session.userImg,
                id: rows[0].boardhealth_id,
                titletext: rows[0].title,
                photo: rows[0].photo,
                details: rows[0].details,
                createdP: rows[0].created_at,
                namehead: rows2[0].username,
                imghead: rows2[0].img,
                view: rows[0].view,
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
      "SELECT tb_communityboard.communityboard_id,tb_communityboard.title,tb_communityboard.photo,tb_communityboard.details,tb_communityboard.status,tb_communityboard.view,tb_communityboard.created_at,tb_communityboard.update_at,tb_user.username,tb_user.img FROM tb_communityboard INNER JOIN tb_user ON tb_communityboard.user_id = tb_user.id ORDER BY communityboard_id DESC",
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
    "SELECT tb_communityboard.communityboard_id,tb_communityboard.title,tb_communityboard.photo,tb_communityboard.details,tb_communityboard.status,tb_communityboard.view,tb_communityboard.created_at,tb_communityboard.update_at, tb_user.username,tb_user.img FROM tb_communityboard INNER JOIN tb_user ON tb_communityboard.user_id = tb_user.id ORDER BY communityboard_id DESC",
    (err, rows) => {
      if (err) {
        req.flash("error", err);
        res.render("board", {
          title: "Board",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
          data: "",
        });
      } else {
        res.render("board", {
          title: "board",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
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
    userImg: req.session.userImg,
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
      userImg: req.session.userImg,
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
            userImg: req.session.userImg,
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
      "SELECT * FROM tb_communityboard WHERE communityboard_id = ?",[id],
      (err, rows, fields) => {
        if (rows.length <= 0) {
          req.flash("error", "ไม่พบกระทู้ = " + id);
          res.redirect("/board");
        } else {
          dbCon.query(
            "SELECT * FROM tb_user WHERE id = ?",[rows[0].user_id],
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
                  id: rows[0].communityboard_id,
                  titletext: rows[0].title,
                  photo: rows[0].photo,
                  details: rows[0].details,
                  createdP: rows[0].created_at,
                  namehead: rows2[0].username,
                  imghead: rows2[0].img,
                  view: rows[0].view,
                });

              }
            }
          );
        }
      }
    );
  }
  dbCon.query("SELECT * FROM tb_communityboard WHERE communityboard_id = ?",[id],(err, rows, fields) => {
      if (rows.length <= 0) {
        req.flash("error", "ไม่พบกระทู้ = " + id);
        res.redirect("/board");
      } else {
        dbCon.query(
          "SELECT * FROM tb_user WHERE id = ?",[rows[0].user_id],(err, rows2, fields) => {
            if (rows2.length <= 0) {
              req.flash("error", "ไม่พบกระทู้ = " + id);
              res.redirect("/board");
            } else {
              res.render("boardDetail", {
                title: "รายละเอียดบอร์ดสุขภาพสุนัข",
                username: req.session.userName,
                emailS: req.session.emailUser,
                levelS: req.session.level,
                userImg: req.session.userImg,
                id: rows[0].communityboard_id,
                titletext: rows[0].title,
                photo: rows[0].photo,
                details: rows[0].details,
                createdP: rows[0].created_at,
                namehead: rows2[0].username,
                imghead: rows2[0].img,
                view: rows[0].view,
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
      "SELECT tb_article.article_id,tb_article.title,tb_article.photo,tb_article.details,tb_article.status,tb_article.view,tb_article.created_at,tb_article.update_at,tb_user.username,tb_user.img FROM tb_article INNER JOIN tb_user ON tb_article.user_id = tb_user.id ORDER BY article_id DESC",
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
    "SELECT tb_article.article_id,tb_article.title,tb_article.photo,tb_article.details,tb_article.status,tb_article.view,tb_article.created_at,tb_article.update_at,tb_user.username,tb_user.img FROM tb_article INNER JOIN tb_user ON tb_article.user_id = tb_user.id ORDER BY article_id DESC",
    (err, rows) => {
      if (err) {
        req.flash("error", err);
        res.render("article", {
          title: "Board Community Article",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
          data: "",
        });
      } else {
        res.render("article", {
          title: "Board Community Article",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
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
    userImg: req.session.userImg,
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
      userImg: req.session.userImg,
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
            userImg: req.session.userImg,
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
      "SELECT * FROM tb_article WHERE article_id = ?",[id],
      (err, rows, fields) => {
        if (rows.length <= 0) {
          req.flash("error", "ไม่พบบทความ = " + id);
          res.redirect("/article");
        } else {
          dbCon.query(
            "SELECT * FROM tb_user WHERE id = ?",[rows[0].user_id],
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
                  id: rows[0].article_id,
                  titletext: rows[0].title,
                  photo: rows[0].photo,
                  details: rows[0].details,
                  createdP: rows[0].created_at,
                  namehead: rows2[0].username,
                  imghead: rows2[0].img,
                  view: rows[0].view,
                });
              }
            }
          );
        }
      }
    );
  }
  dbCon.query("SELECT * FROM tb_article WHERE article_id = ?",[id],(err, rows, fields) => {
      if (rows.length <= 0) {
        req.flash("error", "ไม่พบบทความ = " + id);
        res.redirect("/article");
      } else {
        dbCon.query(
          "SELECT * FROM tb_user WHERE id = ?",[rows[0].user_id],(err, rows2, fields) => {
            if (rows2.length <= 0) {
              req.flash("error", "ไม่พบบทความ = " + id);
              res.redirect("/article");
            } else {
              res.render("articleDetail", {
                title: "รายละเอียดบทความ",
                username: req.session.userName,
                emailS: req.session.emailUser,
                levelS: req.session.level,
                userImg: req.session.userImg,
                id: rows[0].article_id,
                titletext: rows[0].title,
                photo: rows[0].photo,
                details: rows[0].details,
                createdP: rows[0].created_at,
                namehead: rows2[0].username,
                imghead: rows2[0].img,
                view: rows[0].view,
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
  dbCon.query(
    "SELECT * FROM tb_shop WHERE boost != 0",
    (err, shopBoost) => {
      if (err) {
        req.flash("error", err);
        res.redirect("/");
      } else {
        console.log(shopBoost.length);
        for (let n = 0; n < shopBoost.length; n++) {
          dbCon.query(
            "SELECT * FROM tb_boost WHERE shop_id = ? AND status = ?",[shopBoost[n].shop_id,1],
            (err, boost) => {
              if (err) {
                console.log("ERROR ตรวจสอบวันboost"+ err);
              } else {
                let sum = boost[0].date_start - boost[0].date_end;
                // console.log("ลบกัน : "+sum);
                // console.log(boost[n]);
                if (sum <= 0) {
                  //ยังไม่หมดเวลา
                  console.log(shopBoost[n].shop_id +" :"+ sum+": ยังไม่หมดเวลา");
                }else{
                  //หมดเวลาแล้ว
                  console.log(shopBoost[n].shop_id +" :"+ sum+": หมดเวลา");
                  let form_data = {
                    boost: 0,
                  };
                  let form_data1 = {
                    status: 0,
                  };
                  dbCon.query("UPDATE tb_shop SET ? WHERE shop_id = ?",[form_data,shopBoost[n].shop_id], (err, result) => {
                    if (err) {
                      console.log(": อัพเดท boost ใน tb_shop ไม่ได้");
                    } else {
                      dbCon.query("UPDATE tb_boost SET ? WHERE shop_id = ?",[form_data1,shopBoost[n].shop_id], (err, result) => {
                        if (err) {
                          console.log(": อัพเดท status ใน tb_boost ไม่ได้");
                        } else {
                          console.log(": ปรับ shopแล้ว");
                        }
                      })
                    }
                  })
                }
              }
            }
          );     
        }
      }
    }
  );

  if (!req.session.ifNotLogIn) {
    return dbCon.query(
      "SELECT tb_shop.shop_id,tb_shop.title,tb_shop.photo,tb_shop.details,tb_shop.status,tb_shop.boost,tb_shop.view,tb_shop.created_at,tb_shop.update_at, tb_user.username, tb_user_shop.shop_name FROM tb_shop LEFT JOIN tb_user ON tb_shop.user_id = tb_user.id LEFT JOIN tb_user_shop ON tb_shop.user_id = tb_user_shop.user_id ORDER BY boost DESC , shop_id DESC",
      (err, rows) => {
        if (err) {
          req.flash("error", err);
          res.render("shop", {
            title: "Shop",
            username: "0",
            emailS: "0",
            levelS: 0,
            data: "",
          });
        } else {
          res.render("shop", {
            title: "shop",
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
    "SELECT tb_shop.shop_id,tb_shop.title,tb_shop.photo,tb_shop.details,tb_shop.status,tb_shop.boost,tb_shop.view,tb_shop.created_at,tb_shop.update_at, tb_user.username, tb_user_shop.shop_name FROM tb_shop LEFT JOIN tb_user ON tb_shop.user_id = tb_user.id LEFT JOIN tb_user_shop ON tb_shop.user_id = tb_user_shop.user_id ORDER BY boost DESC , shop_id DESC",
    (err, rows) => {
      if (err) {
        req.flash("error", err);
        res.render("shop", {
          title: "Shop",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
          data: "",
        });
      } else {
        res.render("shop", {
          title: "Shop",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
          data: rows,
        });
      }
    }
  );
});

// display shop add page
router.get("/shopDetailAdd", function (req, res, next) {
  if (!req.session.ifNotLogIn || req.session.level === 1) {
    return res.redirect("/shop");
  }
  dbCon.query(
    "SELECT * FROM tb_user_shop WHERE user_id = ?",[req.session.idUser],
    (err, shopUser) => {
      if (err) {
        req.flash("error", err);
        res.redirect("/shop");
      } else {
        if (shopUser.length == 1) {
          res.render("shopDetailAdd", {
            title: "สร้างโฆษณา ร้านค้า",
            username: req.session.userName,
            emailS: req.session.emailUser,
            levelS: req.session.level,
            userImg: req.session.userImg,
            titleboard: "",
            photo: "",
            details: "",
          });
        }
        else{
          req.flash("error", "กรุณเพิ่มข้อมูลร้านค่าก่อนลงโฆษณา");
          res.redirect("/shop");
        }
      }
    }
  );
  
});

// add a new shop
router.post("/shopDetailAdd", upload.single("photo"), (req, res, next) => {
  let titleboard = req.body.titleboard;
  let photo = req.file.filename;
  let details = req.body.details;
  let errors = false;

  console.log("ชื่อรูป : "+photo);

  // if no error
  if (!errors) {
    let form_data = {
      user_id: req.session.idUser,
      title: titleboard,
      photo: photo,
      details: details,
      boost: 0,
      status: 1,
      view:0,
    };

    // insert query
    dbCon.query(
      "INSERT INTO tb_shop SET ?",
      form_data,
      (err, result) => {
        if (err) {
          req.flash("error", err);
          res.render("shopDetailAdd", {
            title: "สร้างโฆษณา ร้านค้า",
            username: req.session.userName,
            emailS: req.session.emailUser,
            levelS: req.session.level,
            userImg: req.session.userImg,
            titleboard: titleboard,
            photo: "",
            details: details,
          });
        } else {
          req.flash("success", "สร้างโฆษณา ร้านค้า สำเร็จ");
          res.redirect("/shop");
        }
      }
    );
  }
});

// display shopDetail page
router.get("/shopDetail/(:id)", (req, res, next) => {
  let id = req.params.id;
  if (!req.session.ifNotLogIn) {
    dbCon.query("SELECT * FROM tb_shop WHERE 	shop_id = ?",[id],
      (err, rowsshop) => {
        if (err) {
          req.flash("error", err);
          return res.render("shopDetail", {
            title: "รายละเอียดโฆษณา",
            username: "0",
            emailS: "0",
            levelS: 0,
            rowsshop:"",
            shopUser:"",
          })    
        } else {
          dbCon.query("SELECT * FROM tb_user_shop WHERE user_id = ?",[rowsshop[0].user_id],
            (err, rowsshopUser) => {
              if (err) {
                req.flash("error", err);
                return res.render("shopDetail", {
                  title: "รายละเอียดโฆษณา",
                  username: "0",
                  emailS: "0",
                  levelS: 0,
                  rowsshop:"",
                  rowsshopUser: "",
                })    
              } else {
                console.log(rowsshop);
                console.log(rowsshopUser);
                return res.render("shopDetail", {
                  title: "รายละเอียดโฆษณา",
                  username: "0",
                  emailS: "0",
                  levelS: 0,
                  rowsshop: rowsshop,
                  rowsshopUser: rowsshopUser,
                }) 
              }
            }
          );
        }
      }
    );
  }else{
    dbCon.query("SELECT * FROM tb_shop WHERE 	shop_id = ?",[id],
      (err, rowsshop) => {
        if (err) {
          req.flash("error", err);
          return res.render("shopDetail", {
            title: "รายละเอียดโฆษณา",
            username: req.session.userName,
            emailS: req.session.emailUser,
            levelS: req.session.level,
            userImg: req.session.userImg,
            rowsshop:"",
            shopUser:"",
          })    
        } else {
          dbCon.query("SELECT * FROM tb_user_shop WHERE user_id = ?",[rowsshop[0].user_id],
            (err, rowsshopUser) => {
              if (err) {
                req.flash("error", err);
                return res.render("shopDetail", {
                  title: "รายละเอียดโฆษณา",
                  username: req.session.userName,
                  emailS: req.session.emailUser,
                  levelS: req.session.level,
                  userImg: req.session.userImg,
                  rowsshop:"",
                  rowsshopUser: "",
                })    
              } else {
                console.log(rowsshop);
                console.log(rowsshopUser);
                return res.render("shopDetail", {
                  title: "รายละเอียดโฆษณา",
                  username: req.session.userName,
                  emailS: req.session.emailUser,
                  levelS: req.session.level,
                  userImg: req.session.userImg,
                  rowsshop: rowsshop,
                  rowsshopUser: rowsshopUser,
                }) 
              }
            }
          );
        }
      }
    );
  }
  


});


//ระบบ point ------------------------------------------------------------------------------------

// หน้าแรก point
router.get("/point", function (req, res, next) {
  if (!req.session.ifNotLogIn || req.session.level === 1) {
    return res.redirect("/");
  }
  dbCon.query(
    "SELECT * FROM tb_point_user WHERE user_id = ?",[req.session.idUser],
    (err, pointShow) => {
      if (err) {
        req.flash("error", err);
        res.redirect("/");
      } else {
        res.render("point", {
          title: "จัดการพอยท์",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
          pointShow: pointShow,
        });
      }
    }
  );
  
});

// add point
router.post("/pointAdd", upload.single("photo"), (req, res, next) => {
  if (!req.session.ifNotLogIn || req.session.level === 1) {
    return res.redirect("/");
  }
  let name = req.body.name;
  let point = req.body.point;
  let photo = req.file.filename;
  let date = req.body.date;
  let time = req.body.time;
  let errors = false;

  console.log(date);
  console.log(time);

  // if no error
  if (!errors) {
    let form_data = {
      user_id: req.session.idUser,
      name: name,
      money: point,
      photo: photo,
      date: date,
      time: time,
      status: 0,
    };

    // insert query
    dbCon.query(
      "INSERT INTO tb_add_point SET ?",
      [form_data],
      (err, result) => {
        if (err) {
          req.flash("error", "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
          res.redirect(req.get('referer'));
        } else {
          req.flash('success', 'ขอบคุณสำหรับการเติมพอทย์ โปรดรอเจ้าหน้าที่ตรวจสอบการเติมพอทย์ 1-2วัน');
          res.redirect(req.get('referer'));
        }
      }
    );
  }
});

// หน้า boost
router.get("/boost", function (req, res, next) {
  if (!req.session.ifNotLogIn || req.session.level === 1) {
    return res.redirect("/");
  }
  dbCon.query(
    "SELECT * FROM tb_shop WHERE user_id = ?",[req.session.idUser],
    (err, shop) => {
      if (err) {
        req.flash("error", err);
        res.redirect("/");
      } else {
        dbCon.query(
          "SELECT * FROM tb_point_user WHERE user_id = ?",[req.session.idUser],
          (err, pointShow) => {
            if (err) {
              req.flash("error", err);
              res.redirect("/");
            } else {
              res.render("boost", {
                title: "จัดการพอยท์",
                username: req.session.userName,
                emailS: req.session.emailUser,
                levelS: req.session.level,
                userImg: req.session.userImg,
                pointShow: pointShow,
                shop: shop,
              });
            }
          }
        );
      }
    }
  );


  
});

// add boost
router.post("/boostAdd", (req, res, next) => {
  if (!req.session.ifNotLogIn || req.session.level === 1) {
    return res.redirect("/");
  }

  let shop_id = req.body.shop_id;
  let money = req.body.money;
  let numday = req.body.numday;
  let errors = false;

  let date_start = new Date(Date.now());
  let date_end = new Date();
  date_end.setTime(date_end.getTime() + numday * 24 * 60 * 60 * 1000);
  let boost = money/numday;

  // if no error
  if (!errors) {
    let form_data = {
      shop_id: shop_id,
      point: money,
      numday: numday,
      date_start: date_start,
      date_end: date_end,
      status: 1,
    };

    let form_data1 = {
      boost: boost,
    };

    

    console.log(form_data);

    // insert query
    dbCon.query(
      "INSERT INTO tb_boost SET ?",
      [form_data],
      (err, result) => {
        if (err) {
          req.flash("error", "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
          res.redirect(req.get('referer'));
        } else {
          dbCon.query("UPDATE tb_shop SET ? WHERE shop_id = ?",[form_data1,shop_id], (err, result) => {
            if (err) {
              req.flash("error", "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
              res.redirect(req.get('referer'));
            } else {
              
              dbCon.query("UPDATE tb_point_user SET point = point - ? WHERE user_id = ?",[money,req.session.idUser], (err, result) => {
                if (err) {
                  req.flash("error", "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
                  res.redirect(req.get('referer'));
                } else {
                  req.flash('success', 'ขอบคุณสำหรับการโปรโมท');
                  res.redirect(req.get('referer'));
                }
              })
            }
          })
        }
      }
    );
  }
});

// หน้า ถอน point
router.get("/pointOut", function (req, res, next) {
  if (!req.session.ifNotLogIn || req.session.level < 3) {
    return res.redirect("/");
  }
  dbCon.query(
    "SELECT * FROM tb_point_user WHERE user_id = ?",[req.session.idUser],
    (err, pointShow) => {
      if (err) {
        req.flash("error", err);
        res.redirect("/");
      } else {
        res.render("pointOut", {
          title: "จัดการพอยท์",
          username: req.session.userName,
          emailS: req.session.emailUser,
          levelS: req.session.level,
          userImg: req.session.userImg,
          pointShow: pointShow,
        });
      }
    }
  );
  
});

// add ถอน point
router.post("/pointOutAdd", (req, res, next) => {
  if (!req.session.ifNotLogIn || req.session.level === 1) {
    return res.redirect("/");
  }

  let bank = req.body.bank;
  let account_number = req.body.account_number;
  let name = req.body.name;
  let money = req.body.money;
  let errors = false;

  // if no error
  if (!errors) {
    let form_data = {
      user_id: req.session.idUser,
      bank: bank,
      account_number: account_number,
      name: name,
      money: money,
      status: 0,
    };

    // insert query
    dbCon.query(
      "INSERT INTO tb_out_point SET ?",
      [form_data],
      (err, result) => {
        if (err) {
          req.flash("error", "พบข้อมผิดพลาดกรุณาลองใหม่อีกครั้ง");
          res.redirect(req.get('referer'));
        } else {
          req.flash('success', 'ขอบคุณสำหรับการถอนพอทย์ โปรดรอเจ้าหน้าที่ตรวจสอบการถอนพอทย์ 1-2วัน');
          res.redirect(req.get('referer'));
        }
      }
    );
  }
});












/* login page. -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
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
    userImg: req.session.userImg,
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
    // res.redirect("/login");
    res.render("login", {
      title: "Login",
      emailS: "0",
      email: email,
      password: password,
    });
  } else {
    // email เช็ค
    dbCon.query("SELECT * FROM tb_user WHERE email = ?",[email],(err, rows) => {
        if (rows.length == 0) {
          errors = true;
          // req.flash("error", "ไม่ข้อมูลผู้ใช้ " + email);
          req.flash("error", "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
          // res.redirect("/login");
          res.render("login", {
            title: "Login",
            emailS: "0",
            email: email,
            password: "",
          });
        } else {
          dbCon.query(
            "SELECT * FROM tb_user WHERE email = ?",[email],
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
                  req.session.userImg = rows[0].img;
                  res.redirect("../");
                } else {
                  req.flash("error", "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
                  res.render("login", {
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

/* regis page. */
router.get("/register", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
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
  }
  return res.redirect("/");

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
      title: "Register",
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
      "SELECT * FROM tb_user WHERE email = ?",email,
      (err, rows) => {
        if (rows.length !== 0) {
          errors = true;
          req.flash("error", "อีเมลนี้มีผู้ใช้งานแล้ว ");
          res.render("register", {
            title: "Register",
            emailS: "0",
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
              title: "Register",
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
                      title: "Register",
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


/* แสดงหน้า โปรไฟล์ --------------------------------------------------------------------------------------------------------------------------------------------------------- */
/* แสดงหน้า โปรไฟล์ร้านค้า --------------------------------------------------------------------------------------------------------------------------------------------------------- */
router.get("/showProfileShop", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.render("showProfileShop", {
      title: "Profile Shop",
      username: "0",
      emailS: "0",
      levelS: 0,
    });
  }
  res.render("showProfileShop", {
    title: "Profile Shop",
    username: req.session.userName,
    emailS: req.session.emailUser,
    levelS: req.session.level,
    userImg: req.session.userImg,
  });
});

/* แสดงหน้า โปรไฟล์ผู้ใช้ --------------------------------------------------------------------------------------------------------------------------------------------------------- */
router.get("/showProfileUser", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.render("showProfileUser", {
      title: "Profile User",
      username: "0",
      emailS: "0",
      levelS: 0,
    });
  }
  res.render("showProfileUser", {
    title: "Profile User",
    username: req.session.userName,
    emailS: req.session.emailUser,
    levelS: req.session.level,
    userImg: req.session.userImg,
  });
});

/* แสดงหน้า โปรไฟล์ผู้เชียวชาญ --------------------------------------------------------------------------------------------------------------------------------------------------------- */
router.get("/showProfileVets", function (req, res, next) {
  if (!req.session.ifNotLogIn) {
    return res.render("showProfileVets", {
      title: "Profile Vets",
      username: "0",
      emailS: "0",
      levelS: 0,
    });
  }
  res.render("showProfileVets", {
    title: "Profile Vets",
    username: req.session.userName,
    emailS: req.session.emailUser,
    levelS: req.session.level,
    userImg: req.session.userImg,
  });
});



/* ปุ่มถูกใจ */
// add a document to the DB collection recording the click event
// Boardhealth
router.post("/clicked/(:id)", (req, res, next) => {
  let boardhealth_id = req.params.id;
  let errors = false;

  if (!errors) {
    let form_data = {
        user_id: req.session.idUser,
        boardhealth_id: boardhealth_id,
        status: 1,
    }

    dbCon.query(
      "SELECT * FROM tb_like_boardhealth WHERE user_id = ? AND boardhealth_id = ?" , [req.session.idUser,boardhealth_id],
      (err, rows1) => {
        if (err) {
          return console.log(err);
        } else {
          if (rows1.length == 1) {
            return console.log("ถูกใจไว้อยู่แล้ว");
          }else{
            dbCon.query("INSERT INTO tb_like_boardhealth SET ?", form_data, (err, result) => {
              if (err) {
                  return console.log(err);
              } else {
                console.log('click added to db');
                res.sendStatus(201);
              }
            })
          }
        }
      }
    );
 }
});

// Article
router.post("/clicked/article/(:id)", (req, res, next) => {
  let article_id = req.params.id;
  let errors = false;

  if (!errors) {
    let form_data = {
        user_id: req.session.idUser,
        article_id: article_id,
        status: 1,
    }

    dbCon.query(
      "SELECT * FROM tb_like_article WHERE user_id = ? AND 	article_id = ?" , [req.session.idUser,article_id],
      (err, rows1) => {
        if (err) {
          return console.log(err);
        } else {
          if (rows1.length == 1) {
            return console.log("ถูกใจไว้อยู่แล้ว");
          }else{
            dbCon.query("INSERT INTO tb_like_article SET ?", form_data, (err, result) => {
              if (err) {
                  return console.log(err);
              } else {
                console.log('click added to db');
                res.sendStatus(201);
              }
            })
          }
        }
      }
    );
 }
});

// Board
router.post("/clicked/Communityboard/(:id)", (req, res, next) => {
  let communityboard_id = req.params.id;
  let errors = false;

  if (!errors) {
    let form_data = {
        user_id: req.session.idUser,
        communityboard_id: communityboard_id,
        status: 1,
    }

    dbCon.query(
      "SELECT * FROM tb_like_communityboard WHERE user_id = ? AND 	communityboard_id = ?" , [req.session.idUser,communityboard_id],
      (err, rows1) => {
        if (err) {
          return console.log(err);
        } else {
          if (rows1.length == 1) {
            return console.log("ถูกใจไว้อยู่แล้ว");
          }else{
            dbCon.query("INSERT INTO tb_like_communityboard SET ?", form_data, (err, result) => {
              if (err) {
                  return console.log(err);
              } else {
                console.log('click added to db');
                res.sendStatus(201);
              }
            })
          }
        }
      }
    );
 }
});

// Shop
router.post("/clicked/shopdetail/(:id)", (req, res, next) => {
  let shop_id = req.params.id;
  let errors = false;

  if (!errors) {
    let form_data = {
        user_id: req.session.idUser,
        shop_id: shop_id,
        status: 1,
    }

    dbCon.query(
      "SELECT * FROM tb_like_shop WHERE user_id = ? AND shop_id = ?" , [req.session.idUser,shop_id],
      (err, rows1) => {
        if (err) {
          return console.log(err);
        } else {
          if (rows1.length == 1) {
            return console.log("ถูกใจไว้อยู่แล้ว");
          }else{
            dbCon.query("INSERT INTO tb_like_shop SET ?", form_data, (err, result) => {
              if (err) {
                  return console.log(err);
              } else {
                console.log('click added to db');
                res.sendStatus(201);
              }
            })
          }
        }
      }
    );
 }
});

// นับถูกใจ
// Boardhealth
router.get("/clicks/(:id)", (req, res, next) => {
  let boardhealth_id = req.params.id;
  dbCon.query(
    "SELECT * FROM tb_like_boardhealth WHERE boardhealth_id = ?" , [boardhealth_id],
    (err, rows) => {
      if (err) {  
        return console.log(err);
      } else {
        res.send(rows);
      }
    }
  );
});

// Article
router.get("/clicks/article/(:id)", (req, res, next) => {
  let article_id = req.params.id;
  dbCon.query(
    "SELECT * FROM tb_like_article WHERE article_id = ?" , [article_id],
    (err, rows) => {
      if (err) {  
        return console.log(err);
      } else {
        res.send(rows);
      }
    }
  );
});

// Board
router.get("/clicks/Communityboard/(:id)", (req, res, next) => {
  let communityboard_id = req.params.id;
  dbCon.query(
    "SELECT * FROM tb_like_communityboard WHERE communityboard_id = ?" , [communityboard_id],
    (err, rows) => {
      if (err) {  
        return console.log(err);
      } else {
        res.send(rows);
      }
    }
  );
});

// Shop
router.get("/clicks/shopdetail/(:id)", (req, res, next) => {
  let shop_id = req.params.id;
  dbCon.query(
    "SELECT * FROM tb_like_shop WHERE shop_id = ?" , [shop_id],
    (err, rows) => {
      if (err) {  
        return console.log(err);
      } else {
        res.send(rows);
      }
    }
  );
});

// เพิ่มคอมเม้น
// Boardhealth
router.post("/commentAddBoardhealth/(:id)", (req, res, next) => {
  if (!req.session.ifNotLogIn) {
    return res.redirect("/");
  }
  let boardhealthId = req.params.id;
  let comment = req.body.comment
  let errors = false;

  if (!errors) {
    let form_data = {
        user_id: req.session.idUser,
        boardhealth_id: boardhealthId,
        comment_details: comment,
        status: 1,
    }
    
    dbCon.query("INSERT INTO tb_comment_boardhealth SET ?", form_data, (err, result) => {
      if (err) {
          return console.log(err);
      } else {
        res.redirect(req.get('referer'));
        // return res.redirect("/boardhealthDetail/"+ boardhealthId);
      }
      }
    );
  }
});

// Article
router.post("/commentAddArticle/(:id)", (req, res, next) => {
  if (!req.session.ifNotLogIn) {
    return res.redirect("/");
  }
  let articleId = req.params.id;
  let comment = req.body.comment
  let errors = false;

  if (!errors) {
    let form_data = {
        user_id: req.session.idUser,
        article_id: articleId,
        comment_details: comment,
        status: 1,
    }
    
    dbCon.query("INSERT INTO tb_comment_article SET ?", form_data, (err, result) => {
      if (err) {
          return console.log(err);
      } else {
        res.redirect(req.get('referer'));
        // return res.redirect("/boardhealthDetail/"+ boardhealthId);
      }
      }
    );
  }
});

// Board
router.post("/commentAddCommunityboard/(:id)", (req, res, next) => {
  if (!req.session.ifNotLogIn) {
    return res.redirect("/");
  }
  let communityboard_id = req.params.id;
  let comment = req.body.comment
  let errors = false;

  if (!errors) {
    let form_data = {
        user_id: req.session.idUser,
        communityboard_id: communityboard_id,
        comment_details: comment,
        status: 1,
    }
    
    dbCon.query("INSERT INTO tb_comment_communityboard SET ?", form_data, (err, result) => {
      if (err) {
          return console.log(err);
      } else {
        res.redirect(req.get('referer'));
        // return res.redirect("/boardhealthDetail/"+ boardhealthId);
      }
      }
    );
  }
});

// Shop
router.post("/commentAddShopdetail/(:id)", (req, res, next) => {
  if (!req.session.ifNotLogIn) {
    return res.redirect("/");
  }
  let shop_id = req.params.id;
  let comment = req.body.comment
  let errors = false;

  if (!errors) {
    let form_data = {
        user_id: req.session.idUser,
        shop_id: shop_id,
        comment_details: comment,
        status: 1,
    }
    
    dbCon.query("INSERT INTO tb_comment_shop SET ?", form_data, (err, result) => {
      if (err) {
          return console.log(err);
      } else {
        res.redirect(req.get('referer'));
        // return res.redirect("/boardhealthDetail/"+ boardhealthId);
      }
      }
    );
  }
});

// แสเงคอมเม้น
// Boardhealth
router.get("/api/user/(:id)", (req, res, next) => {
  let boardhealth_id = req.params.id;
  dbCon.query(
    "SELECT tb_user.username AS name, tb_user.img AS img, tb_comment_boardhealth.comment_details AS comments, tb_comment_boardhealth.update_at AS time FROM tb_comment_boardhealth LEFT JOIN tb_user ON tb_comment_boardhealth.user_id = tb_user.id  WHERE boardhealth_id = ? ORDER BY comment_boardhealth_id DESC" , boardhealth_id,
    (err, users) => {
      if (err) {
        return console.log(err);
      } else {
        // console.log(users);
        res.json(users);
      }
    }
  );
  
});

// Article
router.get("/comment/article/(:id)", (req, res, next) => {
  let article_id = req.params.id;
  dbCon.query(
    "SELECT tb_user.username AS name, tb_user.img AS img, tb_comment_article.comment_details AS comments, tb_comment_article.update_at AS time FROM tb_comment_article LEFT JOIN tb_user ON tb_comment_article.user_id = tb_user.id  WHERE 	article_id = ? ORDER BY 	comment_article_id DESC" , article_id,
    (err, users) => {
      if (err) {
        return console.log(err);
      } else {
        // console.log(users);
        res.json(users);
      }
    }
  );
  
});

// Board
router.get("/comment/Communityboard/(:id)", (req, res, next) => {
  let communityboard_id = req.params.id;
  dbCon.query(
    "SELECT tb_user.username AS name, tb_user.img AS img, tb_comment_communityboard.comment_details AS comments, tb_comment_communityboard.update_at AS time FROM tb_comment_communityboard LEFT JOIN tb_user ON tb_comment_communityboard.user_id = tb_user.id  WHERE 	communityboard_id = ? ORDER BY comment_communityboard_id DESC" , communityboard_id,
    (err, users) => {
      if (err) {
        return console.log(err);
      } else {
        // console.log(users);
        res.json(users);
      }
    }
  );
  
});

// Shop
router.get("/comment/shopdetail/(:id)", (req, res, next) => {
  let shop_id = req.params.id;
  dbCon.query(
    "SELECT tb_user.username AS name, tb_user.img AS img, tb_comment_shop.comment_details AS comments, tb_comment_shop.update_at AS time FROM tb_comment_shop LEFT JOIN tb_user ON tb_comment_shop.user_id = tb_user.id  WHERE shop_id = ? ORDER BY comment_shop_id DESC" , shop_id,
    (err, users) => {
      if (err) {
        return console.log(err);
      } else {
        // console.log(users);
        res.json(users);
      }
    }
  );
  
});

//นับผู้ชม
// Boardhealth
router.post("/countViewBoardhealth/(:id)", (req, res, next) => {
  let boardhealth_id = req.params.id;
  let errors = false;

  if (!errors) {
    dbCon.query(
      "UPDATE tb_boardhealth SET view = view+1 WHERE boardhealth_id = ?", [boardhealth_id],
      (err, rows1) => {
        if (err) {
          return console.log(err);
        } else {
          console.log('click view');
          res.sendStatus(201);
        }
      }
    );
 }
});


// Article
router.post("/countViewArticle/(:id)", (req, res, next) => {
  let article_id = req.params.id;
  let errors = false;

  if (!errors) {
    dbCon.query(
      "UPDATE tb_article SET view = view+1 WHERE article_id = ?",[article_id],
      (err, rows1) => {
        if (err) {
          return console.log(err);
        } else {
          console.log('click view');
          res.sendStatus(201);
        }
      }
    );
 }
});

// Board
router.post("/countViewCommunityboard/(:id)", (req, res, next) => {
  let communityboard_id = req.params.id;
  let errors = false;

  if (!errors) {
    dbCon.query(
      "UPDATE tb_communityboard SET view = view+1 WHERE communityboard_id = ?",[communityboard_id],
      (err, rows1) => {
        if (err) {
          return console.log(err);
        } else {
          console.log('click view');
          res.sendStatus(201);
        }
      }
    );
 }
});

// Shop
router.post("/countViewShopdetail/(:id)", (req, res, next) => {
  let shop_id = req.params.id;
  let errors = false;

  if (!errors) {
    dbCon.query(
      "UPDATE tb_shop SET view = view+1 WHERE shop_id = ?",[shop_id],
      (err, rows1) => {
        if (err) {
          return console.log(err);
        } else {
          console.log('click view');
          res.sendStatus(201);
        }
      }
    );
 }
});


// แสดงรูป shop
router.get("/api/shop/(:id)", (req, res, next) => {
  let shop_id = req.params.id;
  dbCon.query(
    "SELECT tb_shop.photo FROM tb_shop WHERE shop_id = ? " , shop_id,
    (err, photo) => {
      if (err) {
        return console.log(err);
      } else {
        console.log(photo[0].photo);
        res.send(photo[0].photo);
      }
    }
  );
  
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

/* Admin page. */
router.get("/admin", ifNotLogIn, function (req, res, next) {
  res.redirect("admin/login")
});


  //กรณีไม่พบหน้า
  router.get('*', (req, res)=>{
    res.status(404).send('Page Not Found');
  });

module.exports = router;
