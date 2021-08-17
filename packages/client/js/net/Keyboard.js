/**
 * Development tools for triggering some of the serial actions with Keyboard
 * commands. This isn't imported by default, now that the app is in production.
 * All of these functions are normally handled by the serial communication
 * with the microcontroller.
 */
define(
  ['net/Language', 'net/ControlManager', 'net/ControlUI', 'net/AppData'],
  function(Language, ControlManager, ControlUI, AppData) {

    // Initialize Keyboard
    function Keyboard() {}

    Keyboard.init = function() {
      var backdropVid = $('#backdrop_vid');

      // Language controls
      jwerty.key('1', function() { Language.setLanguage(Language.ENGLISH); });
      jwerty.key('2', function() { Language.setLanguage(Language.SPANISH); });

      // Difficulty controls
      jwerty.key('3', function() { ControlManager.setDifficulty(AppData.DIFFICULTY_EASY); });
      jwerty.key('4', function() { ControlManager.setDifficulty(AppData.DIFFICULTY_HARD); });

      // Background fade
      // This wasn't used in the final version
      backdropVid.css('opacity', 0);//temp
      jwerty.key('4', function() { $('#backdrop_vid').show().fadeTo('slow', 0.0)});
      jwerty.key('5', function() { $('#backdrop_vid').show().fadeTo('slow', 0.6)});

      jwerty.key('6', function() {
        backdropVid.insertBefore('#orbit_display');
        backdropVid.get(0).play();
      });

      jwerty.key('7', function() {
        backdropVid.insertBefore('#window_power');
        backdropVid.get(0).play();
      });

      // Oxygen switch
      jwerty.key('q', function() { ControlManager.setControlState('o2_control', ControlUI.STATE_SOLAR); });
      jwerty.key('w', function() { ControlManager.setControlState('o2_control', ControlUI.STATE_OFF); });
      jwerty.key('e', function() { ControlManager.setControlState('o2_control', ControlUI.STATE_BATTERY); });

      // Fan switch
      jwerty.key('a', function() { ControlManager.setControlState('fan_control', ControlUI.STATE_SOLAR); });
      jwerty.key('s', function() { ControlManager.setControlState('fan_control', ControlUI.STATE_OFF); });
      jwerty.key('d', function() { ControlManager.setControlState('fan_control', ControlUI.STATE_BATTERY); });

      // Grow food switch
      jwerty.key('b', function() { ControlManager.setControlState('food_control', ControlUI.STATE_SOLAR); });
      jwerty.key('n', function() { ControlManager.setControlState('food_control', ControlUI.STATE_OFF); });
      jwerty.key('m', function() { ControlManager.setControlState('food_control', ControlUI.STATE_BATTERY); });

      // Comms switch
      jwerty.key('h', function() { ControlManager.setControlState('comm_control', ControlUI.STATE_SOLAR); });
      jwerty.key('j', function() { ControlManager.setControlState('comm_control', ControlUI.STATE_OFF); });
      jwerty.key('k', function() { ControlManager.setControlState('comm_control', ControlUI.STATE_BATTERY); });

      // Heat control
      jwerty.key('u', function() { ControlManager.setControlState('heat_control', ControlUI.STATE_SOLAR); });
      jwerty.key('i', function() { ControlManager.setControlState('heat_control', ControlUI.STATE_OFF); });
      jwerty.key('o', function() { ControlManager.setControlState('heat_control', ControlUI.STATE_BATTERY); });

      // Lighting control
      jwerty.key('8', function() { ControlManager.setControlState('light_control', ControlUI.STATE_SOLAR); });
      jwerty.key('9', function() { ControlManager.setControlState('light_control', ControlUI.STATE_OFF); });
      jwerty.key('0', function() { ControlManager.setControlState('light_control', ControlUI.STATE_BATTERY); });

    };

    return Keyboard;

  }

);
