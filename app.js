var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var fileUpload = require('express-fileupload');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');

var indexRouter = require('./routes/index');
const swaggerDocument = require('./swagger.json');
var groupCoursesRouter = require('./routes/GroupCourses');
var CommentsRouter = require('./routes/Comments');
var RegisterRouter = require('./routes/Register');
var LoginRouter = require('./routes/Login');
var ContactMessageRouter = require('./routes/ContactMessage');
var LessonsRouter = require('./routes/Lesson');
var CalendarRouter = require('./routes/Calendar');
var HomeworkRouter = require('./routes/Homework');
var MessageRouter = require('./routes/Message');
var GroupRouter = require('./routes/Group');
var CertifictaesRouter = require('./routes/Certifictaes');
var UploadFileRouter = require('./routes/UploadFile');
var QuizzRouter = require('./routes/quizz');
var TestQuizz = require('./routes/TestQuizz');
var TestRouter = require('./routes/Test');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use((req, res, next) => {
  req.io = req.app.get('io');
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload({}));

app.use('/', indexRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/v2/courses', groupCoursesRouter);
app.use('/api/v2/lessons', LessonsRouter);
app.use('/api/v2/homework', HomeworkRouter);
app.use('/api/v2/message', MessageRouter);
app.use('/api/v2/comments', CommentsRouter);
app.use('/api/v2/register', RegisterRouter);
app.use('/api/v2/user', LoginRouter);
app.use('/api/v2/contactMessage', ContactMessageRouter);
app.use('/api/v2/upload', UploadFileRouter);
app.use('/api/v2/Calendar', CalendarRouter);
app.use('/api/v2/Group', GroupRouter);
app.use('/api/v2/Certifictaes', CertifictaesRouter);
app.use('/api/v2/TestQuizz', TestQuizz);
app.use('/api/v2/Quizz', QuizzRouter);
app.use('/api/v2/test', TestRouter);

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
