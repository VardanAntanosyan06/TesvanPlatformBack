var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var fileUpload = require('express-fileupload');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
var http = require('http');


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
var DashboardRouter = require('./routes/Dashboard');
var PaymentRouter = require('./routes/Payment');
var SkillRouter = require('./routes/Skill');
var ChatRouter = require('./routes/Chat');
var ChatMessageRouter = require('./routes/ChatMessage');
var GroupChatRouter = require('./routes/GroupChat')
var GroupChatMessageRouter = require('./routes/GroupChatMessage');
// var PresentationRouter = require('./routes/Presentation');
var interviewRouter = require('./routes/Interview');
var app = express();
var server = http.createServer(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// socket.io Server

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});
const { userSockets } = require('./userSockets');
const jwt = require('jsonwebtoken');
io.on('connection', (socket) => {
  try {
    const token = socket?.handshake?.query?.token;
    if (token) {
      jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
          console.error('Token verification error:', err);
          socket.disconnect();
        } else {
          const userId = decoded.user_id;
          userSockets.set(userId, socket);

          console.log('====================================');
          console.log(userId, 'Contected');
          console.log('====================================');

        }
      });
    } else {
      socket.disconnect();
    }
  } catch (e) {
    console.error('Socket connection error:', e);
    socket.disconnect();
  }

  socket.on('disconnect', () => {
    const userId = getUserIdForSocket(socket);
    userId && userSockets.delete(userId);
  });
});

function getUserIdForSocket(socket) {
  for (const [userId, userSocket] of userSockets.entries()) {
    if (userSocket === socket) {
      return userId;
    }
  }
  return null;
}
app.set('io', io);

app.use(async (req, res, next) => {
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
app.use('/api/v2/calendar', CalendarRouter);
app.use('/api/v2/group', GroupRouter);
app.use('/api/v2/certifictaes', CertifictaesRouter);
app.use('/api/v2/testQuizz', TestQuizz);
app.use('/api/v2/quizz', QuizzRouter);
app.use('/api/v2/dashboard', DashboardRouter);
app.use('/api/v2/skill', SkillRouter);
app.use('/api/v2/payment', PaymentRouter);
app.use('/api/v2/chat', ChatRouter);
app.use('/api/v2/groupChat', GroupChatRouter);
app.use('/api/v2/chatMessage', ChatMessageRouter);
app.use('/api/v2/groupChatMessage', GroupChatMessageRouter);
app.use('/api/v2/interview', interviewRouter);

// app.use('/api/v2/presentation', PresentationRouter);

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



module.exports = { app, server };
