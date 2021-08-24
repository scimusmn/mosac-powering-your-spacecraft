var serialLookup = require('./data/serialPort.js')
var portName = serialLookup.serialPort();

/**
 * For WebSockets, require 'ws'.Server
 */

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 8080});

// Tell the wsServer what to do on connection to a client;

var webSock = null;
var serialPort = null;

wss.on('connection', function(ws) {

  webSock = ws;
  console.log('connected');

  ws.on('message', function(message) {
    /*switch(message.split("=")[0]){
     default:

     break;
     }*/
    if (serialPort) serialPort.write(message + '|');
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

var SerialPort = require('serialport');

// Uncomment to list all available ports
// (async () => {
//   try {
//     const serialList = await SerialPort.list();
//     serialList.forEach(function(port) {
//       console.log(port.comName);
//      });
//   } catch (e) {
//     console.log(e);
//   }
// })()

// const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
serialPort = new SerialPort(portName, {
  baudRate: 115200,
})

const parser = new Readline();
serialPort.pipe(parser);

serialPort.on('open', function() {
  setTimeout(() => {
    serialPort.write('{wake-arduino:1}');
  }, 1000);
})

parser.on('data', (data) => {
  if (webSock) webSock.send(data);
  console.log(data);
});

// Examples of correct outward communication
// setTimeout(() => {
//   serialPort.write('{sun:on}');
// }, 5000);

// setTimeout(() => {
//   serialPort.write('{get-all-states:1}');
// }, 7500);

// setTimeout(() => {
//   serialPort.write('{sun:off}');
// }, 9500);