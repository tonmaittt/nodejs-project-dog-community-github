var express = require("express");
var router = express.Router();
let dbCon = require("../lib/db");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* login page. */
router.get("/login", function (req, res, next) {
  res.render("loginUser", { title: "Express" });
});

/* regis page. */
router.get("/regis", function (req, res, next) {
  res.render("regisUser", { title: "Express" });
});

/* userData page. */
router.get("/user", function (req, res, next) {
  dbCon.query("SELECT * FROM tb_user ORDER BY id asc", (err, rows) => {
    if (err) {
      req.flash("error", err);
      res.render("userData", { data: "" });
    } else {
      res.render("userData", { data: rows });
    }
  });
});

module.exports = router;
