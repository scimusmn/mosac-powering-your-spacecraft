define(['net/AppData', 'net/webSockets'],function(AppData, wsClient) {

  /*"Devices" are the objects used to represent the rotary switches which
  * visitors may use to provide power to the tabletop devices from either the
  * batteries or the solar panel.
  * solPin is the arduino pin number of the switch for solar power.
  * batPin is the arduino pin number of the switch for battery power.*/

  function Device() {

    var _this = this;
    _this.state = 0;
    _this.onchange = null;

    _this.setState = function(val) {

      // OFF = 0;
      // SOLAR = 1;
      // BATTERY = 2;

      let powerState = 0;
      if (val === 'solar') {
        powerState = 1;
      } else if (val === 'battery') {
        powerState = 2;
      }
      _this.state = powerState;
      if (_this.onchange) _this.onchange();
    }

  }

  /* "Switch" is the software representation of the hardware rotary and toggle
  * switches that control difficulty and language. The constructor takes one
  * argument; the pin to which the hardware switch is connected.
  */
  function Switch() {
    var _this = this;
    _this.state = 0;
    _this.onchange = null;

    _this.setState = function(val) {

      // EASY = 0;
      // HARD = 1;
  
      _this.state = (val === 'hard') ? 1 : 0;
      if (_this.onchange) _this.onchange();
    }

  }

  /*
   * Title: hardware
   * Description: Object to hold all of the info about the hardware setup
   */

  function hardware() {

  }

  // hardware.battery holds the current charge level of the battery
  hardware.battery = 0;

  // hardware.batteryState determines if the battery is available or not
  hardware.batteryState = false;

  // initCB is the callback funtion to be call on initialization
  hardware.initCB = null;

  // Send a message to the websocket client.
  hardware.sendToArduino = function(msg) {
    wsClient.send(msg);
  };

  // Handle messages coming from websocket connection
  hardware.onData = function(evt) {
    const { data } = evt;
    console.log('harware->onData', data);

    let [message, value] = data.split(':');
    message = message.substring(1);
    value = value.substring(0, value.length - 2);

    console.log(message, value);

    // Note - this is where we patch the original hardware naming
    // scheme to the new arduino message scheme. (e.g. grow -> food) -tn
    switch (message) {
      case 'interior':
        hardware.lights.setState(value);
        break;
      case 'cook':
        hardware.heat.setState(value);
        break;
      case 'communication':
        hardware.comm.setState(value);
        break;
      case 'grow':
        hardware.food.setState(value);
        break;
      case 'fan':
        hardware.fan.setState(value);
        break;
      case 'oxygen':
        hardware.oxygen.setState(value);
        break;
      case 'level':
        hardware.difficulty.setState(value);
        break;
      case 'arduino-ready':
        console.log('Arduino is ready...');
        break;
      default:
        console.log('Unknown message:', message);
        break;
    }
  };

  /*
   * Title: hardware.link
   * Description: connects the hardware function to the arduino object
   * to allow for communication with the hardware, as well as sets the initCB
   * and turns the sun on for the first time
   */
  hardware.link = function(cb) {

    // Initialize connection to websocket client and
    // set the onData message callback.
    wsClient.setOnDataCallback(hardware.onData);
    wsClient.connect(hardware.init);

    hardware.initCB = cb;

    // Set initial sun state
    setTimeout(() => {
      hardware.sunState(1);
    }, 50);
  };

  // hardware.batteryInt is the stores the interval timer for checking battery voltage
  hardware.batteryInt = null;

  // switchTime stores the time that the battery was last disabled, to make sure it
  // is not simply toggling on and off
  hardware.switchTime = Date.now();

  // if the battery is currently active, record the current time, tell the arduino to
  // shut off the relay to the batteries, and set the flag that the battery is inactive
  hardware.disableBattery = function() {
    if (hardware.batteryState && !AppData.getSolarAvailable()) {
      hardware.switchTime = Date.now();
      // arduino.digitalWrite(2, 1);
      hardware.batteryState = false;
    }
  };

  /*
   * Title: enableBattery
   * Description: Make the battery available to the devices. This function also checks
   * to make sure it has been at least two seconds since the battery was disabled, and
   * that the flag for the battery state is not set before turning on the relay to the
   * batteries.
   */
  hardware.enableBattery = function() {
    if ((Date.now() - hardware.switchTime > 2000 && !hardware.batteryState) || AppData.getSolarAvailable()) {
      hardware.batteryState = true;
      // arduino.digitalWrite(2, 0);
    }
  };

  /*
   * Title: init
   * Description: function to set all of the devices and switches to their
   * default pins. Also sets the handler for incoming data about battery voltage
   * from the arduino. Must be called after hardware.link.
   */
  hardware.init = function() {

    // TODO-TN: This should be refactored to retain
    // callbacks, but change based on message strings not pins
    hardware.oxygen = new Device();
    hardware.fan = new Device();
    hardware.food = new Device();
    hardware.comm = new Device();
    hardware.heat = new Device();
    hardware.lights = new Device();

    hardware.difficulty = new Switch();

    // TODO-TN: This value must now come from simulation
    // instead of this handler. Can be removed once the battery drain
    // is simulated elsewhere in application code.

    // arduino.setHandler(0, function(pin, val) {
    //   //NOTE: uncomment the following line to monitor the incoming value, for calibration
    //   //console.log("Incoming value: "+val);
    //   hardware.battery = Math.floor((val - AppData.batteryOffset) / AppData.batteryScale);
    //   if (hardware.battery <= 0) {
    //     hardware.disableBattery();
    //   } else if (hardware.battery >= 20) {
    //     // TODO: figure out why this is empty
    //     // This is empty because once the battery is drained, the battery stays
    //     // disabled until the sun rises again, which is set in ControlManager.js
    //     // this used to happen when the battery voltage raised above the 20% mark,
    //     // but there was no advantage to this setup.
    //     //hardware.enableBattery();
    //   }
    // });

    //set the interval for reading the battery voltage from the arduino
    // TODO-TN: This can be removed once the battery drain
    // is simulated elsewhere in application code.
    // hardware.batteryInt = setInterval(function() {
    //   arduino.analogRead(0);
    // }, 500);

    //if there is an init callback, call it.
    if (hardware.initCB) hardware.initCB();
  };

  /*
   * Title: sunState
   * Description: starts the ramping function to control the sun's brightness.
   * The timeout controls the time between each analogWrite.
   */
  // TODO-TN: This should simply send out the 
  // message to the arduino to turn sun light on or off, 
  // and let arduino handle the rest.

  // 0 = off (out of sunlight)
  // 1 = on (in sunlight)
  hardware.sunState = function(mode) {
    console.log('☀️ sunState()', mode);
    // setTimeout(hardware.rampSun, 10);
    const onOff = mode ? 'on' : 'off';
    console.log('sending', onOff);
    wsClient.send(`{sun:${onOff}}`);
  };

  return hardware;

});
