var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

let flash = require('express-flash');
let session = require('express-session');
let mysql = require('mysql2');
let connection = require('./lib/db');

var adminRouter = require('./routes/admin');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var userDataRouter = require('./routes/userData');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'assets')));
// path รูป img
app.use("/img",express.static('img'));
// app.use("/assets",express.static('assets'));

app.use(session({
  cookie: { maxAge: 7200000},
  // store: new session.MemoryStore,
  saveUninitialized: flash,
  resave: flash,
  secret: 'secret'
}))

app.use(flash());

app.use('/admin', adminRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/userData', userDataRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
