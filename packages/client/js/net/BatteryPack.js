define(
  ['net/Battery', 'tween'],
  function(Battery, tween) {

    function BatteryPack(containerDivLeft, containerDivRight, alertDiv) {

      this.powerLevel = 100;
      this.textDisplay = $(containerDivLeft).parent().parent().find('#batteries_level_percent').last();

      this.batteries = [new Battery(containerDivLeft), new Battery(containerDivRight)];

      this.warningState = false;
      this.deadState = false;
      this.alertDiv = alertDiv || null;

    }

    // updatePackLevel() | Update remaining power level of whole pack. Levels between 0 - 100
    BatteryPack.prototype.updatePackLevel = function(level) {

      // Clamp battery level 0-100
      this.powerLevel = Math.round(Math.max(0, Math.min(level, 100)));

      this.batteries[0].updateBatteryLevel(this.powerLevel, false);
      this.batteries[1].updateBatteryLevel(this.powerLevel, false);

      this.refreshText();

    };

    BatteryPack.prototype.refreshText = function() {

      $(this.textDisplay).html(this.powerLevel + '&#8202;%');

      // WARNING
      if (this.powerLevel < 25 && this.powerLevel > 0 && this.warningState == false) {

        $(this.textDisplay).addClass('warning-red');
        TweenMax.set($(this.textDisplay), {css: {scale:1, transformOrigin: '50% 50%'}});
        TweenMax.to($(this.textDisplay), 0.5, {css: {scale:1.5, transformOrigin: '50% 50%'}, repeat:-1, yoyo:true});
        this.warningState = true;
        this.alertDisplay(false);

        // NORMAL
      } else if (this.powerLevel >= 25 && (this.warningState == true || this.deadState == true)) {

        $(this.textDisplay).removeClass('warning-red');
        TweenMax.to($(this.textDisplay), 0.25, {css: {scale:1, transformOrigin: '50% 50%'}});
        this.warningState = false;
        this.deadState = false;
        this.alertDisplay(false);

        // EMPTY
      } else if (this.powerLevel <= 0  && (this.warningState == true || this.deadState == false)) {

        $(this.textDisplay).addClass('warning-red');
        TweenMax.killTweensOf($(this.textDisplay));
        TweenMax.to($(this.textDisplay), 0.5, {css: {scale:1, transformOrigin: '50% 50%'}});
        this.warningState = false;
        this.deadState = true;
        this.alertDisplay(true);

      }

    };

    BatteryPack.prototype.alertDisplay = function(doShow) {
      if (!this.alertDiv) return;
      if (doShow) {
        TweenMax.set($(this.alertDiv), {css: {opacity:0}});
        TweenMax.to($(this.alertDiv), 0.3, {css: {opacity:1}, repeat:6, yoyo:true, ease:Power3.EaseOut});
        $(this.alertDiv).show();
      } else {
        TweenMax.to($(this.alertDiv), 0.3, {css: {opacity:0}});
      }
    };

    // setFailStates() | Turn on/off fail states for each battery
    BatteryPack.prototype.setFailStates = function(battLeftFail, battRightFail) {

      if (battLeftFail == false) {
        this.batteries[0].clearFailState();
      }else {
        this.batteries[0].showFailState();
      }

      if (battRightFail == false) {
        this.batteries[1].clearFailState();
      }else {
        this.batteries[1].showFailState();
      }

    };

    return BatteryPack;

  }

);
