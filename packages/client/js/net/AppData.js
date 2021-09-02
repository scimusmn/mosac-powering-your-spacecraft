define([], function() {
  function AppData() { }

  // Constants
  AppData.SHADOW_ENTER_ANGLE = 136; // Angle space-station enters shadow
  AppData.SHADOW_EXIT_ANGLE = 279; // Angle space-station exits shadow

  AppData.DIFFICULTY_EASY = 0;
  AppData.DIFFICULTY_HARD = 1;

  // Colors
  AppData.WARNING_RED = '#cb242c';
  AppData.GO_GREEN = '#cb242c';

  AppData.updateSettings = function (configXML) {
    this.configXML = configXML;

    // Settings from XML
    this.secondaryLanguage = this.getSetting('secondaryLanguage');
    if (!this.secondaryLanguage) this.secondaryLanguage = 'es';
    this.developerMode = this.getBool('developerMode');
    this.orbitDuration = this.getInt('orbitDuration');
    this.o2FillRate = this.getFloat('o2FillRate');
    this.o2DepletionRate = this.getFloat('o2DepletionRate');
    this.o2UpdateRate = this.getFloat('o2UpdateRate');
    this.circulationFillRate = this.getFloat('circulationFillRate');
    this.circulationDepletionRate = this.getFloat('circulationDepletionRate');
    this.circulationUpdateRate = this.getFloat('circulationUpdateRate');
    this.invertedSwitches = this.getBool('invertedSwitches');
    this.invertedLanguageSwitches = this.getBool('invertedLanguageSwitches');
    // this.batteryScale = this.getFloat('batteryScale');
    // this.batteryOffset = this.getFloat('batteryOffset');

    this.batteryFillRate = this.getFloat('batteryFillRate');

    this.oxygenBatteryDraw = this.getFloat('oxygenBatteryDraw');
    this.fanBatteryDraw = this.getFloat('fanBatteryDraw');
    this.foodBatteryDraw = this.getFloat('foodBatteryDraw');
    this.commBatteryDraw = this.getFloat('commBatteryDraw');
    this.heatBatteryDraw = this.getFloat('heatBatteryDraw');
    this.lightsBatteryDraw = this.getFloat('lightsBatteryDraw');

    // Global Vars
    this.currentStateId = '';
    this.solarAvailable = true;

    this.currentPowerLevel = 100;
    this.currentDifficulty = AppData.DIFFICULTY_EASY;

    this.failureCount = 0;
    AppData.secsForFailureState = 7;
    this.failureState = false;
    AppData.failureAlerts = [];
    setInterval(AppData.checkFailureState, 1000);
  };

  AppData.getInt = function (id) {
    return parseInt(this.getSetting(id));
  };

  AppData.getFloat = function (id) {
    return parseFloat(this.getSetting(id));
  };

  AppData.getBool = function (id) {
    return (this.getSetting(id) == 'true');
  };

  AppData.getSetting = function (id) {
    return $(this.configXML).find('setting[id=' + id + ']').attr('value');
  };

  AppData.setCurrentState = function (stateId) {
    this.currentStateId = stateId;
  };

  AppData.setSolarAvailable = function (value) {
    this.solarAvailable = value;
  };

  AppData.getSolarAvailable = function () {
    return this.solarAvailable;
  };

  AppData.setDifficulty = function (value) {
    this.currentDifficulty = value;
  };

  AppData.getDifficulty = function () {
    return this.currentDifficulty;
  };

  AppData.registerFailureAlert = function (aDiv) {
    AppData.failureAlerts.push(aDiv);
  };

  AppData.checkFailureState = function () {
    if (!AppData.failureAlerts) return;
    
    var fstate = false;
    for (var i = 0; i < AppData.failureAlerts.length; i++) {
      var isShowing = $(AppData.failureAlerts[i]).is(':visible');
      var opac = $(AppData.failureAlerts[i]).css('opacity');
      if (isShowing == true && opac == 1) {
        fstate = true;
        break;
      }
    }

    if (fstate == false && this.failureState == true) {
      AppData.showFailure(false);
    }

    this.failureState = fstate;

    if (this.failureState == true) {
      this.failureCount++;
    } else {
      this.failureCount = 0;
    }

    // Show for 10 seconds once a critical life support is empty for [this.secsForFailureState] seconds.
    if (this.failureCount == AppData.secsForFailureState) {
      AppData.showFailure(true);
    } else if (this.failureCount == AppData.secsForFailureState + 10) {
      AppData.showFailure(false);
    }
  };

  AppData.showFailure = function (doShow) {
    if (doShow) {
      $('#popup_you_are_dead').stop().fadeIn('slow');
    } else {
      $('#popup_you_are_dead').stop().fadeOut('slow');
    }
  };

  return AppData;
});
