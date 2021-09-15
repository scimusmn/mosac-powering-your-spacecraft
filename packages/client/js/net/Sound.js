define(
  ['net/AppData', 'howler'],
  function(AppData, Howler) {

    var sounds = {};

    function Sound() {

    }

    //Preload a list of snds in a directory. Assumes all sounds are .ogg format.
    Sound.preloadSounds = function(directory, names) {

      for (var i = 0; i < names.length; i++) {
        sounds[names[i]] = new Howl({
          urls: [directory + names[i] + '.ogg']
        });
      }

    };

    //Play a preloaded sound right now
    Sound.play = function(sndId) {

      var s = sounds[sndId];
      if (s) {
        s.play();
      } else {
        // console.log('Sound '+sndId+' not found.');
      }

      // Whenever telecom sound plays, we
      // also want to play station sound,
      // which will come out of dashboard.
      if (sndId === 'telecom') {
        var sndRadioStation = sounds['station'];
        sndRadioStation.play();
      }

    };

    //Stop a sound if it is currently playing
    Sound.stop = function(sndId, quickFade) {

      var s = sounds[sndId];
      if (s) {
        s.stop();
      } else {
        // console.log('Sound ['+sndId+'] not found.');
      }

      // Whenever telecom sound stops, we
      // also want to stop station sound.
      if (sndId === 'telecom') {
        var sndRadioStation = sounds['station'];
        sndRadioStation.stop();
      }

    };

    Sound.loadAndPlaySound = function(sndURLs) {

      var sound = new Howl({
        urls: sndURLs
      }).play();

    };

    return Sound;

  }

);
