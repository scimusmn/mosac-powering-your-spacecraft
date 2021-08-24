var serialLookup = require('./data/serialPort.js')
var portName = serialLookup.serialPort();

/**
 * For WebSockets, require 'ws'.Server
 */

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 8080});

// Tell the wsServer what to do on connection to a client;

var webSock = null;
var sp = null;

wss.on('connection', function(ws) {

  webSock = ws;
  console.log('connected');

  ws.on('message', function(message) {
    /*switch(message.split("=")[0]){
     default:

     break;
     }*/
    if (sp) sp.write(message + '|');
    console.log(message);
  });

  ws.on('close', function() {
    webSock = null;
  });

  ws.on('error', function(error) {
    webSock = null;
    console.log('Error: ' + error);
  });

});

/**
 * Use the cool library
 * git://github.com/voodootikigod/node-serialport.git
 * to read the serial port where Arduino is sitting.
 */

var com = require('serialport');
var bufSize = 512;

sp = new com.SerialPort(portName, {
  baudrate: 9600,
  parser: com.parsers.readline('\r\n'),
  buffersize:bufSize
});

sp.on('open', function() {
  sp.on('data', function(data) {
    if (webSock) webSock.send(data);
    console.log(data);
  });
});
