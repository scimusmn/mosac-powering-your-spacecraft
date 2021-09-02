define(
  [
    'net/AppData', 'net/ControlUI', 'net/Battery', 'net/BatteryPack',
    'net/Hardware', 'net/Language', 'net/Sound'
  ],
  function(AppData, ControlUI, Battery, BatteryPack, hardware, Language, Sound) {

    ControlManager.controls = [];

    function ControlManager() { }

    /* setup() | Setup all controls */
    ControlManager.setupControls = function() {

      ControlManager.controls.push(new ControlUI('#o2_control', 32, true, 'bubbles'));
      ControlManager.controls.push(new ControlUI('#fan_control', 4, true, 'fan'));

      ControlManager.controls.push(new ControlUI('#food_control', 67, false, 'rustling', $('#food_warning'), AppData.orbitDuration * 1.5));
      ControlManager.controls.push(new ControlUI('#comm_control', 9, true, 'telecom', $('#comm_warning'), AppData.orbitDuration * 0.5));
      ControlManager.controls.push(new ControlUI('#heat_control', 15, true, 'cooking', $('#heat_warning'), AppData.orbitDuration * 2));
      ControlManager.controls.push(new ControlUI('#light_control', 3, true, 'lights', $('#lights_warning'), AppData.orbitDuration * 0.5));

      ControlManager.batteryPack = new BatteryPack('#battery_left', '#battery_right', $('#batteries_depleted'));
      ControlManager.o2Level = new Battery('#o2_level_container', false, $('#oxygen_depleted'), 'male-breathing', 25);
      ControlManager.fanLevel = new Battery('#fan_level', true, $('#circulation_depleted'), 'female-breathing', 50);

      ControlManager.linkHardware();

    };

    /* linkHardware() | Connect hardware functions to front-end*/
    ControlManager.linkHardware = function() {

      // TODO-TN: This could be replaced with one big
      // onData(data) function and a switch statement to parse message/value.

      hardware.link(function() {

        hardware.oxygen.onchange = function() {
          ControlManager.setControlState('o2_control', this.state);
        };

        hardware.fan.onchange = function() {
          ControlManager.setControlState('fan_control', this.state)
        };

        hardware.food.onchange = function() {
          ControlManager.setControlState('food_control', this.state)
        };

        hardware.comm.onchange = function() {
          ControlManager.setControlState('com' + 'm_control', this.state)
        };

        hardware.heat.onchange = function() {
          ControlManager.setControlState('heat_control', this.state)
        };

        hardware.lights.onchange = function() {
          ControlManager.setControlState('light_control', this.state)
        };

        // hardware.language.onchange = function() {
        //   Language.convertState(this.state);
        // };

        hardware.difficulty.onchange = function() {
          ControlManager.setDifficulty(this.state)
        };

        // hardware.update();

      });

      setInterval(ControlManager.checkBatteries, 1000);
      setInterval(ControlManager.checkAuxiliaryEquipment, 1000);

    };

    // var batteryGood = true;
    // var incTimeout = null;

    /***********************************
     * Function: incrementUp
     * Arguments: None
     * Description: As long as hardware.battery is greater than
     * AppData.currentPowerLevel, increment currentPowerLevel, update the display,
     * wait half a second, and do this function again.
     ***********************************/

    // ControlManager.incrementUp = function() {
    //   if (AppData.currentPowerLevel < hardware.battery) {
    //     AppData.currentPowerLevel++;
    //     clearTimeout(incTimeout);
    //     incTimeout = setTimeout(ControlManager.incrementUp, 500);
    //     ControlManager.batteryPack.updatePackLevel(AppData.currentPowerLevel);
    //   }
    // };

    ControlManager.checkBatteries = function() {

      console.log('checkBatteries');

      // TODO-TN: Deplete battery for every system that is 
      // using battery power. 
      // Question - Is this how it worked before? Does every life system
      // use the same amount of power? 

      // TODO-TN: If in sunlight, fill batteries. 

      // Deplete battery for every active life system currently using battery.
      if (hardware.oxygen.state === 2) AppData.currentPowerLevel -= AppData.oxygenBatteryDraw;
      if (hardware.fan.state === 2) AppData.currentPowerLevel -= AppData.fanBatteryDraw;
      if (hardware.food.state === 2) AppData.currentPowerLevel -= AppData.foodBatteryDraw;
      if (hardware.comm.state === 2) AppData.currentPowerLevel -= AppData.commBatteryDraw;
      if (hardware.heat.state === 2) AppData.currentPowerLevel -= AppData.heatBatteryDraw;
      if (hardware.lights.state === 2) AppData.currentPowerLevel -= AppData.lightsBatteryDraw;
      
      // var reading = hardware.battery;
      // var prevReading = AppData.currentPowerLevel;

      // console.log('reading', reading);
      // console.log('prevReading', prevReading);

      //AppData.currentPowerLevel = reading;
      //ControlManager.batteryPack.updatePackLevel( AppData.currentPowerLevel );

      // if the sun is on, and the battery pack is turned off, turn it on
      if (AppData.solarAvailable) {
        // hardware.enableBattery();
        AppData.currentPowerLevel += AppData.batteryFillRate;
      }
      //else, if the battery pack is inactive, keep the reading at 0
      // else if (!hardware.batteryState) {
      //   reading = 0;
      // }

      // if the sun is on, check the try to increment the power level
      // if (AppData.solarAvailable) ControlManager.incrementUp();
      // if we're in the night pass, don't let the battery voltage spring back up
      // when a device is turned off.
      // else if (reading < prevReading) AppData.currentPowerLevel = reading;

      console.log('AppData.currentPowerLevel', AppData.currentPowerLevel);

      // Clamp power level
      if (AppData.currentPowerLevel < 0) AppData.currentPowerLevel = 0;
      if (AppData.currentPowerLevel > 100) AppData.currentPowerLevel = 100;

      ControlManager.batteryPack.updatePackLevel(AppData.currentPowerLevel);

      //Update displays if there batteries have changed to or from an empty state
      /*if (prevReading > 0 && reading <= 0){
       ControlManager.refreshControlDisplays();
       } else if (prevReading <= 0 && reading > 0){
       ControlManager.refreshControlDisplays();
       }*/
      // if ((batteryGood && !reading) || (!batteryGood && reading)) {
        ControlManager.refreshControlDisplays();
        ControlManager.batteryPack.warningState = (AppData.currentPowerLevel > 25);
        ControlManager.batteryPack.deadState = (AppData.currentPowerLevel > 0);
        ControlManager.batteryPack.refreshText();
        // batteryGood = reading;
      // }

    };

    ControlManager.checkAuxiliaryEquipment = function() {

      for (var i = 0; i < ControlManager.controls.length; i++) {

        ControlManager.controls[i].checkFailureTimeout();

      }

    };

    /* getControlById() | Setup the state of a specific control by id */
    ControlManager.getControlById = function(controlId) {

      var control = {};
      for (var i = 0; i < ControlManager.controls.length; i++) {
        if (ControlManager.controls[i].id == controlId) {
          control = ControlManager.controls[i];
          break;
        }
      }

      return control;

    };

    /* setSolarAvailable() */
    ControlManager.setSolarAvailable = function(value) {

      AppData.setSolarAvailable(value);

      // This tells the arduino to start ramping up
      // or ramping down the light until it reaches complete
      // on or off. 
      // TODO: This can be updated to now
      // simply tell the arduino to turn on or off, 
      // and the arduino will do the ramping. -tn
      hardware.sunState(+value);//0 or 1

      this.refreshControlDisplays();

    };

    /* setControlState() | Set state of specific control */
    ControlManager.setControlState = function(controlId, stateId) {

      ControlManager.getControlById(controlId).setState(stateId);

      if (controlId == 'o2_control' || controlId == 'fan_control') {
        this.refreshFillBars();
      }

    };

    /* refreshControlDisplays() | Refresh all control displays against current states */
    ControlManager.refreshControlDisplays = function() {

      for (var i = 0; i < this.controls.length; i++) {
        this.controls[i].refreshStateDisplay();
      }

      this.refreshFillBars();

    };

    /* refreshFillBars() | Start filling or depleting fill bars based on current state */
    ControlManager.refreshFillBars = function() {

      var c = ControlManager.getControlById('o2_control');

      if (c.isActive) {
        this.o2Level.timedFill(AppData.o2FillRate, AppData.o2UpdateRate);
      }else {
        this.o2Level.timedFill(AppData.o2DepletionRate, AppData.o2UpdateRate);
      }

      c = this.getControlById('fan_control');

      if (c.isActive) {
        this.fanLevel.timedFill(AppData.circulationFillRate, AppData.circulationUpdateRate);
      }else {
        this.fanLevel.timedFill(AppData.circulationDepletionRate, AppData.circulationUpdateRate);
      }

    };

    /* setDifficulty() | Update control states and levels based on new difficulty */
    ControlManager.setDifficulty = function(value) {

      //temp
      if (value > 1)value = 1;

      AppData.setDifficulty(value);

      if (value == AppData.DIFFICULTY_EASY) {
        //enable batteries
        this.batteryPack.setFailStates(false, false);
      } else {
        //disable right-side battery
        this.batteryPack.setFailStates(false, true);
      }

    };

    return ControlManager;

  }

);
