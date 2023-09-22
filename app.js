var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');

var indexRouter = require('./routes/index');
var groupCoursesRouter = require('./routes/GroupCourses');
var CommentsRouter = require('./routes/Comments');
var RegisterRouter = require('./routes/Register');
var LoginRouter = require('./routes/Login');
var ContactMessageRouter = require('./routes/ContactMessage');

var app = express();
// const options = './swagger_output.json';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(require('./controlers/swaggeracontroller').swaggerSpec),
);
app.use('/api/v2/courses', groupCoursesRouter);
app.use('/api/v2/comments', CommentsRouter);
app.use('/api/v2/register', RegisterRouter);
app.use('/api/v2/user', LoginRouter);
app.use('/api/v2/contactMessage', ContactMessageRouter);
app.use(require('express-status-monitor')());
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
