#!/usr/bin/env node

/* Module dependencies. */
var app = require('../app');
var debug = require('debug')('confusionserver:server');
var http = require('http');
var https = require('https');
var fs = require('fs');
const path = require("path")

/* Get port from environment and store in Express. */
var port = normalizePort(process.env.PORT || 5000);
app.set('port', port);
app.set('secPort', port+443);

/* Create HTTP server. */
var server = http.createServer(app);

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

/* Listen on provided port, on all network interfaces. */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

var options = {
  key: fs.readFileSync(__dirname + '/67543204_localhost3000.key'),
  cert: fs.readFileSync(__dirname + '/67543204_localhost3000.cert')
};

var secureServer = https.createServer(options, app);

secureServer.listen(app.get('secPort'), () => {
  console.log('Secure Server listening on port ', app.get('secPort'))
});

secureServer.on('error', onError);
secureServer.on('Listening', onListening);

/* Normalize a port into a number, string, or false. */

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}

/* Event listener for HTTP server "error" event. */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

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
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}