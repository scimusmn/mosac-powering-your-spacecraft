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

    };

    //Stop a sound if it is currently playing
    Sound.stop = function(sndId, quickFade) {

      var s = sounds[sndId];
      if (s) {
        s.stop();
      } else {
        // console.log('Sound ['+sndId+'] not found.');
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
