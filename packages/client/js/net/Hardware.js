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

  // Send a message to the websocket client.
  hardware.requestInitialStates = function() {
    console.log('requestInitialStates');

    setTimeout(() => {
      wsClient.send('{get-all-states:1}');
    }, 150);
    
  };

  // Handle messages coming from websocket connection
  hardware.onData = function(evt) {
    const { data } = evt;
    // console.log('hardware.onData', data);

    let [message, value] = data.split(':');
    message = message.substring(1);
    value = value.substring(0, value.length - 2);

    console.log('hardware.onData:', message, value);

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

    // Set initial sun/battery state
    setTimeout(() => {
      hardware.sunState(1);
      setTimeout(() => {
        hardware.batteryState(1);
      }, 50);
    }, 50);
  };

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

    hardware.oxygen = new Device();
    hardware.fan = new Device();
    hardware.food = new Device();
    hardware.comm = new Device();
    hardware.heat = new Device();
    hardware.lights = new Device();
    hardware.difficulty = new Switch();

    //if there is an init callback, call it.
    if (hardware.initCB) hardware.initCB();
  };

  /*
   * Title: sunState
   * Description: starts the ramping function to control the sun's brightness.
   * The timeout controls the time between each analogWrite.
   */

  // 0 = off (out of sunlight)
  // 1 = on (in sunlight)
  hardware.sunState = function(mode) {
    const onOff = mode ? 'on' : 'off';
    wsClient.send(`{sun:${onOff}}`);
  };

  /*
   * Title: batteryState
   * Description: Tells Arduino when battery power is available or not.
   */

  // 0 = off (battery power is unavailable)
  // 1 = on (battery power is available)
  hardware.batteryState = function(mode) {
    console.log('hardware.batteryState()', mode);
    const onOff = mode ? 'on' : 'off';
    console.log('sending', onOff);
    wsClient.send(`{battery-available:${onOff}}`);
  };

  return hardware;

});
