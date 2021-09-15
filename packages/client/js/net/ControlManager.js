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

        hardware.difficulty.onchange = function() {
          ControlManager.setDifficulty(this.state)
        };

      });

      // After linking hardware, request initial states from 
      // all switches/knobs and update UI to match. 
      hardware.requestInitialStates();


      // Kick off intervals that control simulated battery levels
      // (This is no longer hardware-based, but leaving here 
      // to avoid introducing new bugs -tn)
      setInterval(ControlManager.checkBatteries, 1000);
      setInterval(ControlManager.checkAuxiliaryEquipment, 1000);

    };

    ControlManager.checkBatteries = function() {

      // How much the battery power level should be increased or decreased
      let powerAdjustment = 0;

      // Deplete battery for every active life system currently using battery.
      if (hardware.oxygen.state === 2) powerAdjustment -= AppData.oxygenBatteryDraw;
      if (hardware.fan.state === 2) powerAdjustment -= AppData.fanBatteryDraw;
      if (hardware.food.state === 2) powerAdjustment -= AppData.foodBatteryDraw;
      if (hardware.comm.state === 2) powerAdjustment -= AppData.commBatteryDraw;
      if (hardware.heat.state === 2) powerAdjustment -= AppData.heatBatteryDraw;
      if (hardware.lights.state === 2) powerAdjustment -= AppData.lightsBatteryDraw;

      // Multiply overall power draw when in HARD mode
      if (AppData.getDifficulty() === AppData.DIFFICULTY_HARD) powerAdjustment *= AppData.hardMultiplierBatteryDraw;

      // If the sun is view, increase the battery power level.
      if (AppData.solarAvailable) {
        powerAdjustment += AppData.batteryFillRate;
        // Multiply overall solar power fill when in HARD mode
        if (AppData.getDifficulty() === AppData.DIFFICULTY_HARD) powerAdjustment *= AppData.hardMultiplierBatteryFillRate;
      }

      // Apply the power adjustment to the current battery level
      AppData.currentPowerLevel +=  powerAdjustment;

      // Clamp power level between 0 and 100
      if (AppData.currentPowerLevel < 0) AppData.currentPowerLevel = 0;
      if (AppData.currentPowerLevel > 100) AppData.currentPowerLevel = 100;

      // Update the current battery pack level
      ControlManager.batteryPack.updatePackLevel(AppData.currentPowerLevel);

      // Update the battery UI
      ControlManager.refreshControlDisplays(false);
      ControlManager.batteryPack.warningState = (AppData.currentPowerLevel > 25);
      ControlManager.batteryPack.deadState = (AppData.currentPowerLevel > 0);
      ControlManager.batteryPack.refreshText();

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
      // or ramping down the light 
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
