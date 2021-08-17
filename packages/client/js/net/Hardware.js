define(['net/AppData', 'net/arduinoControl'],function(AppData, arduino) {

  /*"Devices" are the objects used to represent the rotary switches which
  * visitors may use to provide power to the tabletop devices from either the
  * batteries or the solar panel.
  * solPin is the arduino pin number of the switch for solar power.
  * batPin is the arduino pin number of the switch for battery power.*/

  function Device(solPin, batPin) {

    //if we specify that the switches are backward from normal,
    // flip the switches for battery and solar
    if (AppData.invertedSwitches) {
      var temp = batPin;
      batPin = solPin;
      solPin = temp;
    }

    var _this = this;
    _this.state = 0;

    _this.onchange = null;

    //set the function to handle when the solar pin toggles on or off
    arduino.watchPin(solPin, function(pin, val) {
      _this.state = (val) ? 0 : 1;
      if (_this.onchange) _this.onchange();

    });

    //set the function to handle when the battery pin toggles on or off
    arduino.watchPin(batPin, function(pin, val) {
      _this.state = (val) ? 0 : 2;
      if (_this.onchange) _this.onchange();
    });

    //requests the current state of the solar and battery switches
    _this.update = function() {
      arduino.digitalRead(solPin);
      arduino.digitalRead(batPin);
    }
  }

  /* "Switch" is the software representation of the hardware rotary and toggle
  * switches that control difficulty and language. The constructor takes one
  * argument; the pin to which the hardware switch is connected.
  */
  function Switch(pin) {
    var _this = this;
    _this.state = 0;

    _this.onchange = null;

    // function to set the handlers for each of the switches.
    arduino.watchPin(pin, function(pin, val) {
      _this.state = val;
      if (_this.onchange) _this.onchange();

    });
  }

  /*
   * Title: hardware
   * Description: Obeject to hold all of the info about the hardware setup
   */

  function hardware() {

  }

  // hardware.battery holds the current charge level of the battery
  hardware.battery = 0;

  // hardware.batteryState determines if the battery is available or not
  hardware.batteryState = false;

  // initCB is the callback funtion to be call on initialization
  hardware.initCB = null;

  /*
   * Title: hardware.link
   * Description: connects the hardware function to the arduino object
   * to allow for communication with the hardware, as well as sets the initCB
   * and turns the sun on for the first time
   */
  hardware.link = function(cb) {
    arduino.connect(hardware.init);
    hardware.initCB = cb;
    hardware.sunState(1);
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
      arduino.digitalWrite(2, 1);
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
      arduino.digitalWrite(2, 0);
    }
  };

  /*
   * Title: update
   * Description: force a refresh of the current state of the devices.
   */
  hardware.update = function() {
    hardware.oxygen.update();
    hardware.fan.update();
    hardware.food.update();
    hardware.comm.update();
    hardware.heat.update();
    hardware.lights.update();
  };

  /*
   * Title: init
   * Description: function to set all of the devices and switches to their
   * default pins. Also sets the handler for incoming data about battery voltage
   * from the arduino. Must be called after hardware.link.
   */
  hardware.init = function() {

    hardware.oxygen = new Device(5, 4);
    hardware.fan = new Device(7, 6);
    hardware.food = new Device(9, 8);
    hardware.comm = new Device(11, 10);
    hardware.heat = new Device(13, 12);
    hardware.lights = new Device(19, 18);

    hardware.language = new Switch(16);
    hardware.difficulty = new Switch(17);

    arduino.setHandler(0, function(pin, val) {
      //NOTE: uncomment the following line to monitor the incoming value, for calibration
      //console.log("Incoming value: "+val);
      hardware.battery = Math.floor((val - AppData.batteryOffset) / AppData.batteryScale);
      if (hardware.battery <= 0) {
        hardware.disableBattery();
      } else if (hardware.battery >= 20) {
        // TODO: figure out why this is empty
        // This is empty because once the battery is drained, the battery stays
        // disabled until the sun rises again, which is set in ControlManager.js
        // this used to happen when the battery voltage raised above the 20% mark,
        // but there was no advantage to this setup.
        //hardware.enableBattery();
      }
    });

    //set the interval for reading the battery voltage from the arduino
    hardware.batteryInt = setInterval(function() {
      arduino.analogRead(0);
    }, 500);

    //if there is an init callback, call it.
    if (hardware.initCB) hardware.initCB();
  };

  var sunLevel = 100;
  var snState = true;
  var sunInt = null;

  /*
   * Title: sunState
   * Description: starts the ramping function to control the sun's brightness.
   * The timeout controls the time between each analogWrite.
   */
  hardware.sunState = function(mode) {
    snState = mode;
    setTimeout(hardware.rampSun, 10);
  };

  /*
   * Title: rampSun
   * Description: controls turning the brightness of the sun up or down.
   * if the snState is true, but the sunLevel is not at it's maximum, increment
   * the sunLevel, command the arduino to that level, and set this function to
   * be call again in 10ms.
   * if the snState is false, but the sunLevel is not at it's minimum, decrement
   * the sunLevel, command the arduino to that level, and set this function to
   * be call again in 10ms.
   */
  hardware.rampSun = function() {
    if (snState && sunLevel < 255) {
      arduino.analogWrite(3, sunLevel++);
      if (sunLevel < 255) setTimeout(hardware.rampSun, 10);
    } else if (!snState && sunLevel > 100) {
      arduino.analogWrite(3, sunLevel--);
      if (sunLevel > 100) setTimeout(hardware.rampSun, 10);
    }
  };

  //return hardware for the purposes of require.js
  return hardware;

});
