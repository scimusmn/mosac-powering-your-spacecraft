/* ========================================================================================
   Battery
   ===================================================================================== */

define(['tween', 'net/Language', 'net/Sound', 'net/AppData'], function(tween, Language, Sound, AppData) {

  // STATES
  Battery.STATE_DEAD = 'dead';
  Battery.STATE_FULL = 'full';
  Battery.STATE_DEPLETING = 'depleting';

  Battery.COLORS = ['#DF0E1F', '#DF191E', '#DC321A', '#DF4A1D', '#DC6D1A', '#DE8018', '#D29519', '#AD961A', '#A8951D', '#98961D', '#8F9320', '#4F9126', '#328B29', '#288A2B'];
  Battery.TEXT_FEEDBACK = ['circulation_feedback_poor', 'circulation_feedback_good', 'circulation_feedback_excellent'];

  function Battery(containerDiv, useFeedbackText, alertDiv, sndId, warningLevel) {

    this.alertDiv = alertDiv || null;
    if (this.alertDiv) AppData.registerFailureAlert($(this.alertDiv));
    this.containerDiv = containerDiv;
    this.sndId = sndId || '';
    this.mask = $(this.containerDiv).find('#mask');
    this.levelBar = $(this.containerDiv).find('#level_bar');
    this.textDisplay = $(this.containerDiv).find('.bottom').last();

    this.failState = $(this.containerDiv).find('#fail');
    $(this.failState).hide();

    this.fillTimer = {};
    this.warningState = false;
    this.powerLevel = 100;
    this.warningLevel = warningLevel || 25;
    this.useTextFeedback = useFeedbackText || false;

  }

  /**
   * updateBatteryLevel() | Update remaining power level of the battery. Battery levels are between 0 - 100
   */
  Battery.prototype.updateBatteryLevel = function(level, snapToBars) {

    this.powerLevel = Math.round(level);

    if (this.powerLevel > 100) this.powerLevel = 100;
    if (this.powerLevel <= 0) this.powerLevel = 0;

    var visLevel = this.powerLevel;

    if (snapToBars == true) visLevel = snapToFourth(visLevel);

    var levelScale = 1 - (visLevel / 100);

    TweenLite.to($(this.mask), 0.3, {css: {scaleY:levelScale, transformOrigin: '50% 0%'}, ease:Linear.easeNone});

    if (this.textDisplay.length > 0) {
      this.refreshText();
    }

  };

  Battery.prototype.refreshText = function() {

    if (this.useTextFeedback == false) {
      $(this.textDisplay).html(this.powerLevel + '&#8202;%');
    } else {
      $(this.textDisplay).attr('id', this.currentLevelFeedback());
      Language.refreshTranslation($(this.textDisplay));
    }

    // WARNING
    if (this.powerLevel < this.warningLevel && this.powerLevel > 0 && this.warningState == false) {

      $(this.textDisplay).addClass('warning-red');
      TweenMax.set($(this.textDisplay), {css: {scale:1, transformOrigin: '50% 50%'}});
      TweenMax.to($(this.textDisplay), 0.5, {css: {scale:1.5, transformOrigin: '50% 50%'}, repeat:-1, yoyo:true});
      this.warningState = true;
      this.alertDisplay(false);

    // NORMAL
    } else if (this.powerLevel >= this.warningLevel && this.warningState == true) {

      $(this.textDisplay).removeClass('warning-red');
      TweenMax.to($(this.textDisplay), 0.25, {css: {scale:1, transformOrigin: '50% 50%'}});
      this.warningState = false;
      this.alertDisplay(false);

    // EMPTY
    } else if (this.powerLevel <= 0 && this.warningState == true) {

      $(this.textDisplay).addClass('warning-red');
      TweenMax.killTweensOf($(this.textDisplay));
      TweenMax.to($(this.textDisplay), 0.5, {css: {scale:1, transformOrigin: '50% 50%'}});
      this.warningState = false;
      this.alertDisplay(true);

      Sound.play('alarms');
      Sound.play(this.sndId);

    }

  };

  Battery.prototype.alertDisplay = function(doShow) {
    if (!this.alertDiv) return;
    if (doShow) {
      TweenMax.set($(this.alertDiv), {css: {opacity:0}});
      TweenMax.to($(this.alertDiv), 0.3, {css: {opacity:1}, repeat:6, yoyo:true, ease:Power3.EaseOut});
      $(this.alertDiv).show();
    } else {
      TweenMax.to($(this.alertDiv), 0.3, {css: {opacity:0}});
    }
  };

  Battery.prototype.currentLevelColor = function() {
    var c = Math.floor((this.powerLevel / 100) * Battery.COLORS.length);
    return Battery.COLORS[c];
  };

  Battery.prototype.currentLevelFeedback = function() {
    var f;
    if (this.powerLevel > 80) {
      f = 2;
    } else if (this.powerLevel > 50) {
      f = 1;
    } else {
      f = 0;
    }

    return Battery.TEXT_FEEDBACK[f];
  };

  Battery.prototype.timedFill = function(increment, updateRate) {

    clearInterval(this.fillTimer);

    var _this = this;
    _this.fillTimer = setInterval(function() {

      _this.updateBatteryLevel(_this.powerLevel + increment);

    }, updateRate);

  };

  Battery.prototype.clearFailState = function() {

    $(this.failState).parent().children().show();
    $(this.failState).hide();

  };

  Battery.prototype.showFailState = function() {

    $(this.failState).parent().children().hide();
    $(this.failState).show();

  };

  function snapToFourth(value) {

    var snappedValue = 0;

    if (value >= 75) {

      snappedValue = 100;

    } else if (value > 50) {

      snappedValue = 75;

    } else if (value > 25) {

      snappedValue = 50;

    } else if (value > 0) {

      snappedValue = 25;

    }

    return snappedValue;

  }

  return Battery;

});
