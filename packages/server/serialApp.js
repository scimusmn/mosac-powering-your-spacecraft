/**
 * For WebSockets, require 'ws'.Server
 */

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 8080});

var webSock = null;
var serialPort = null;

wss.on('connection', function(ws) {

  webSock = ws;
  console.log('connected');

  ws.on('message', function(message) {
    // Forward message from client to serial port
    if (serialPort) serialPort.write(message);
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

var SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const parser = new Readline();

// Auto find Arduino by searching ports
SerialPort.list().then((list) => {
  Object.keys(list).forEach((key) => {
    const portInfo = list[key];
    const { path, manufacturer } = portInfo;
    console.log('Checking port:', manufacturer, path);
    if (manufacturer !== undefined) {
      if (manufacturer.includes('Arduino') 
        || manufacturer.includes('Adafruit')
        || manufacturer.includes('Silicon Labs')) {
        console.log(`Auto-enabling: ${path} - ${manufacturer}`);
        enableSerial(path);
      }
    }
  });
}); 

const enableSerial = (path) => {
  serialPort = new SerialPort(path, { baudRate: 115200, autoOpen: false });

  serialPort = new SerialPort(path, {
    baudRate: 115200,
  }, (err) => {
    console.log('SerialPort open event');
    if (err) {
      console.log('Error: ' + err);
    } else {
      setTimeout(() => {
        serialPort.write('{wake-arduino:1}');
      }, 1000);
    }
  });

  serialPort.pipe(parser);

  parser.on('data', (data) => {
    // Forward message from Arduino to client application
    if (webSock) webSock.send(data);
    console.log(data);
  });

}
