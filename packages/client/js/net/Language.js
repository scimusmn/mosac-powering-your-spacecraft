define(
  ['net/AppData'],
  function(AppData) {

    //Track current language
    Language.translationXML = {};
    Language.currentLanguage = '';

    //Language Keys
    Language.ENGLISH = 'en';
    Language.SPANISH = AppData.secondaryLanguage;
  
    // Hack to wait for app start      
    setTimeout(function () {
      Language.SPANISH = AppData.secondaryLanguage;
    }, 5500);

    function Language() {

    }

    /* setupTranslations() | Accepts xml to be searched. */
    Language.setupTranslations = function(xml) {

      Language.translationXML = xml;

      //default to english
      Language.setLanguage(Language.ENGLISH);

    };

    /* setLanguage() | Find and replace all text by translation ids */
    Language.setLanguage = function(languageId) {

      Language.currentLanguage = languageId;

      //Find all swappable language
      $('#wrapper').find('p,h1,h2,h3,span').each(function() {

        Language.refreshTranslation(this);

      });

    };

    /**
     Figure out the differences between these two. A physical wire might be crossed
     */
    Language.convertState = function(state) {
      var langState;
      if (AppData.invertedLanguageSwitches) {
        var langState = 1;
      } else {
        langState = 0;
      }

      if (state == langState) {
        Language.setLanguage(Language.ENGLISH);
      } else {
        Language.setLanguage(Language.SPANISH);
      }
    };

    Language.refreshTranslation = function(translateElement) {

      //Retrieve translation text from translation xml
      var translationId = $(translateElement).attr('id');
      var translationText = Language.getTranslation(translationId);

      //Apply to html
      if (translationText != '') $(translateElement).html(translationText);

    };

    Language.getTranslation = function(translationId) {

      return $(Language.translationXML).find('text[id="' + translationId + '"]').children(Language.currentLanguage).first().text();

    };

    /* getCurrentLanguage() | Return the current displayed language key. */
    Language.getCurrentLanguage = function() {

      return Language.currentLanguage;

    };

    return Language;

  }

);
