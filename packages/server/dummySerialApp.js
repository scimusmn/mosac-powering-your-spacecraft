/**
 * Generate a fake serial connection for testing the front end application
 * when the real Arduino serial connection is not in place.
 */

function random(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

function DummyDev(num) {
  var _this = this;
  _this.pin = num;
  _this.state = 0;
  _this.bound = null;
  _this.timer = null;
  var oldDevState = 0;
  var oldState = 0;
  _this.onChange = null;

  _this.toggle = function() {
    var newState = random(0, 3);
    while (newState == oldDevState) newState = random(0, 3);
    _this.state = newState % 2;
    if (_this.bound) {
      _this.bound.state = ((newState == 2) ? 1 : 0);
      _this.bound.checkChange();
    }

    _this.checkChange();
    _this.timer = setTimeout(_this.toggle, random(7000, 30000));
    oldDevState = newState;
  };

  _this.checkChange = function() {
    if (_this.onChange && oldState != _this.state) {
      _this.onChange(_this);
      oldState = _this.state;
    }
  };

  _this.bind = function(tie) {
    _this.bound = tie;
    tie.bound = _this;
    clearTimeout(tie.timer);
  };

  _this.timer = setTimeout(_this.toggle, random(7000, 30000));
}

var dummyParse = new function() {
  var _this = this;
  var pins = [];
  _this.lights = 1;
  var analogInt = null;
  _this.battLevel = 0;

  function setup() {
    for (var i = 0; i < 20; i++) {
      pins[i] = new DummyDev(i);
    }

    for (var j = 2; j < 20; j += 2) {
      pins[j].bind(pins[j + 1]);
    }
  }

  setup();

  var onChange = function(dev) {
    if (webSock) webSock.send('r|pinChange(' + dev.pin + ',' + dev.state + ')');
    console.log('pinChange(' + dev.pin + ',' + dev.state + ')');
  };

  _this.fakeBattery = function() {
    if (_this.lights > 0) {
      if (_this.battLevel++ >= 255) _this.battLevel = 255;
    }
    else if ((_this.battLevel -= 3) <= 0) _this.battLevel = 0;
    if (webSock) webSock.send('r|analogRead(0)=' + _this.battLevel);
  };

  _this.parse = function(message) {
    var spl = message.split(/[\s,()=]+/);
    switch (spl[0]){
      case 'watchPin':
        pins[parseInt(spl[1])].onChange = onChange;
        console.log('watching pin ' + spl[1]);
        break;
      case 'digitalWrite':
        _this.lights = spl[2];
        console.log(_this.lights);
        break;
      case 'analogReport':
        analogInt = setInterval(_this.fakeBattery.bind(this), parseInt(spl[2]));
        console.log('Reporting battery');
        break;
      default:
        break;
    }
  }
};

//dummyParse.parse("watchPin(2)");

/*******************************************
 // For WebSockets, require 'ws'.Server
 ********************************************/

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 8080});

//Tell the wsServer what to do on connection to a client;

var webSock = null;
var sp = null;

wss.on('connection', function(ws) {

  webSock = ws;

  ws.on('message', function(message) {
    var data = message.split('|');
    switch (data[0]){
      case 'c':
        for (var i in wss.clients) {
          wss.clients[i].send(message);
          console.log(i);
        }

        break;

      case 'r':
        console.log(data[1]);
        dummyParse.parse(data[1]);
        break;

      default:
        break;
    }
  });

  ws.on('close', function() {
    webSock = null;
  });

  ws.on('error', function(error) {
    webSock = null;
    console.log('Error: ' + error);
  });

});
