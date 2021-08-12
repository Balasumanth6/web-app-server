var createError = require('http-errors');
var debug = require('debug')('confusionserver:server');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var http = require('http');

var authenticate = require('./authenticate');
var config = require('./config');

const mongoose = require('mongoose');
const url = process.env.mongoUrl || config.mongoUrl;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var uploadRouter = require('./routes/uploadRouter.js');
var leadersRouter = require('./routes/leaderRouter.js');
var promotionsRouter = require('./routes/promoRouter.js');
var favoritesRouter = require('./routes/favoritesRouter.js');
var commentRouter = require('./routes/commentRouter.js');

mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
}).then(() => console.log("MongoDB has been connected"))
.catch((err) => console.log(err));

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {return val;}
  if (port >= 0) {return port;}
  return false;
}
var port = normalizePort(process.env.PORT || 5000);

// app.all('*', (req, res, next) => {
// 	if (req.secure) {return next();}
// 	else {res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);}
// });

var app = express();
var server = http.createServer(app);
server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})
server.on('error', onError);
server.on('listening', onListening);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('12345-67890-09876-54321')); //see node-express folder for cookies

app.use(passport.initialize());
// app.use(passport.sesion());

// app.use(express.static(path.join(__dirname, "client", "build")))
    
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/dishes', dishRouter);
app.use('/promotions', promotionsRouter);
app.use('/leaders', leadersRouter);
app.use('/imageUpload', uploadRouter);
app.use('/favorites', favoritesRouter);
app.use('/comments', commentRouter);

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

function onError(error) {
  if (error.syscall !== 'listen') {throw error;}

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/* Event listener for HTTP server "listening" event. */
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

module.exports = app;