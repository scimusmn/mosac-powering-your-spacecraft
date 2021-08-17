require.config({

  // By default load any module IDs from js/ directory
  baseUrl: 'js',

  // Setup up shortcuts for commonly used libraries and components
  paths: {
    jquery: 'vendor/jquery/jquery.min',
    tween: 'vendor/gsap/src/minified/TweenMax.min',
    animatesprite: 'vendor/animatesprite/scripts/jquery.animateSprite',
    howler: 'vendor/howler/howler.min'
  }

});

require(
  [
    'jquery',
    'net/AppData',
    // 'net/Keyboard',
    'net/Language',
    'net/ControlManager',
    'net/Sound',
    'net/TimeTicker',
    'tween'
  ],
  function($, AppData, Language, ControlManager, Sound, TimeTicker, tween) {
  // function($, AppData, Keyboard, Language, ControlManager, Sound, TimeTicker, tween) {
    /**
     * Initial load
     */

      // Load config settings
    $.ajax({
      type: 'GET',
      url: 'data/settings.xml',
      dataType: 'xml',
      success: function (xml) {

        // Load settings data into the application
        AppData.updateSettings(xml);

        // Now that the settings and copy are loaded, initialize the application
        loadLanguage();
        initialize();
      },

      error: function (jqXHR, textStatus, errorThrown) {
        // Show error message if desired

      }
    });
    function loadLanguage() {
      // Load English and Spanish copy
      $.ajax({
        type: 'GET',
        url: 'data/copy.xml',
        dataType: 'xml',
        success: function (xml) {
          Language.setupTranslations($(xml).find('component').first());
        }
      });
    }

    function initialize() {
      // Load sound effects
      Sound.preloadSounds('sounds/', [
        'alarms', 'rustling', 'cooking', 'fan', 'lights', 'telecom',
        'male-breathing', 'female-breathing', 'bubbles'
      ]);

      /**
       * Wait a few seconds for the audio files to completely load
       *
       * Without this delay, there are intermittent audio loading issues
       * causing some of the sound effect to fail.
       */
      setTimeout(function () {

        // Setup the knob settings and their on-screen visuals
        ControlManager.setupControls();

        // Setup development keyboard commands. For testing only. 
        // Keyboard.init();

        // Start space station animation
        startSpaceStationOrbit();

      }, 5000);
    }

    function startSpaceStationOrbit() {
      var containerBeacon = $('#container_beacon');

      //Orbit Earth
      TweenMax.to($('.space_station_container'), AppData.orbitDuration, {
        css: {rotation: 360},
        ease: Linear.easeNone,
        repeat: -1,
        onUpdate: onStationRotateUpdate
      });

      //Time readout
      //the Space Station orbits Earth (and sees a sunrise) once every 92 minutes
      var minuteRatio = AppData.orbitDuration / (92 * 60);
      var updateSpeed = Math.floor(1000 * minuteRatio);
      var t = new TimeTicker($('#time_clock'), updateSpeed);

      //Pulse beacon light
      TweenMax.set(containerBeacon, {css: {opacity: 0.6}});
      TweenMax.to(containerBeacon, 0.5, {
        css: {opacity: 1}, repeat: -1, yoyo: true
      });

    }

    function onStationRotateUpdate() {

      var rotation = $(".space_station_container")[0]._gsTransform.rotation;

      if (rotation < AppData.SHADOW_EXIT_ANGLE && rotation > AppData.SHADOW_ENTER_ANGLE) {

        //In Earth's shadow
        if (AppData.getSolarAvailable() == true) {

          ControlManager.setSolarAvailable(false);
          $("#available").attr('id', 'unavailable');
          Language.refreshTranslation($("#unavailable"));
          $("#unavailable").removeClass('go-green').addClass('warning-red');
          TweenMax.set($("#unavailable"), {
            css: {
              scale: 1,
              transformOrigin: "50% 50%"
            }
          });
          TweenMax.to($("#unavailable"), 0.25, {
            css: {
              scale: 1.25,
              transformOrigin: "50% 50%"
            }, ease: Power2.easeOut, repeat: 1, yoyo: true
          });

        }

      } else {

        //In Sun's light
        if (AppData.getSolarAvailable() == false) {

          ControlManager.setSolarAvailable(true);
          $("#unavailable").attr('id', 'available');
          Language.refreshTranslation($("#available"));
          $("#available").removeClass('warning-red').addClass('go-green');
          TweenMax.set($("#available"), {
            css: {
              scale: 1,
              transformOrigin: "50% 50%"
            }
          });
          TweenMax.to($("#available"), 0.25, {
            css: {
              scale: 1.25,
              transformOrigin: "50% 50%"
            }, ease: Power2.easeOut, repeat: 1, yoyo: true
          });

        }

      }
    }
  }

);
