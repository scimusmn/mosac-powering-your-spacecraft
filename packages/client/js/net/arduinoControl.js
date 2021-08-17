define(['net/webSockets'], function(wsClient) {

  function arduino() { }

  arduino.handlers = [];

  //function to handle messages received from the websocket connection
  arduino.onMessage = function(evt) {
    var dataRay = evt.data.split(/[\s|,()=]+/);
    switch (dataRay[0]){
      case 'pinChange':
      case 'digitalRead':
      case 'analogRead':
        //pass data from the packet to the appropriate handler.
        if (arduino.handlers[parseInt(dataRay[1])]) arduino.handlers[parseInt(dataRay[1])](parseInt(dataRay[1]), parseInt(dataRay[2]));
        break;
      default:
        break;
    }
  };

  //call this function to connect the websocket client to the server; also sets \
  // the message callback for the ws client
  arduino.connect = function(cb) {
    wsClient.setMsgCallback(arduino.onMessage);
    wsClient.connect(cb);
  };

  //arduino command functions follow; each sends instructions to the arduino,
  //via the websocket connection and the node.js program.
  arduino.digitalWrite = function(pin, dir) {
    wsClient.send('r|digitalWrite(' + pin + ',' + dir + ')');
  };

  arduino.digitalRead = function(pin) {
    wsClient.send('r|digitalRead(' + pin + ')');
  };

  arduino.analogWrite = function(pin, val) {
    wsClient.send('r|analogWrite(' + pin + ',' + val + ')');
  };

  arduino.watchPin = function(pin, handler) {
    wsClient.send('r|watchPin(' + pin + ')');
    arduino.handlers[pin] = handler;
  };

  arduino.analogReport = function(pin, interval, handler) {
    wsClient.send('r|analogReport(' + pin + ',' + interval + ')');
    arduino.handlers[pin] = handler;
  };

  arduino.setHandler = function(pin, handler) {
    arduino.handlers[pin] = handler;
  };

  arduino.analogRead = function(pin) {
    wsClient.send('r|analogRead(' + pin + ')');
  };

  arduino.stopReport = function(pin) {
    wsClient.send('r|stopReport(' + pin + ')');
  };

  return arduino;

});
