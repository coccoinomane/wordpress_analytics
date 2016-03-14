/**
 * Javascript for use with Universal Google Analytics (GA) that tracks
 * clicks on phone numbers within a webpage.
 *
 * To be tracked, the phone numbers must be in the following markup:
 *
 *   <a href="tel:+1-303-499-7111">+1 (303) 499-7111</a>
 *
 * See https://developers.google.com/web/fundamentals/native-hardware
 * /click-to-call/?hl=en for further details.
 *
 * This script optionally applies the correct 'tel:' markup to phone
 * numbers if they haven't it already. To to so, pass the attribute
 * detectPhoneNumbers='1' in the HTML tag calling this script.
 * 
 * Created by Guido W. Pettinari on 02.03.2016.
 * Part of Wordpress Analytics:
 * https://github.com/coccoinomane/wordpress_analytics
 */

jQuery(document).ready(function($) {


  // ==========================================================================
  // =                              Initialisation                            =
  // ==========================================================================

  /* Get the current script, using a selector that matches any src attributes
  that end with the filename of this file */
  var this_js_script = $('script[src*=call_tracking\\.js]');

  /* Debug flag, set to true to log useful messages */
  var debugMode = parseInt (this_js_script.attr('debug'));
  if (debugMode === undefined)
    debugMode = false;

  /* Should we automatically add the 'tel:' markup to phone numbers in the page? */
  var detectPhoneNumbers = this_js_script.attr('detectPhoneNumbers');
  if (detectPhoneNumbers === undefined)
    detectPhoneNumbers = false;

  /* Regex pattern (include) used to validate & find phone numbers in the webpage */
  var regexIncludePattern = this_js_script.attr('regexIncludePattern');
  if (regexIncludePattern === undefined)
    regexIncludePattern = '';

  /* Regex pattern (exclude) used to validate & find phone numbers in the webpage */
  var regexExcludePattern = this_js_script.attr('regexExcludePattern');
  if (regexExcludePattern === undefined)
    regexExcludePattern = '';

  /* Get some information about the current page */
  var pageTitle = document.title;

  /* Delimiters that can appear in phone numbers */
  var delimiters = [' ', '.', '-', ','];
  

  // ===========================================================================
  // =                             Track phone clicks                          =
  // ===========================================================================

  /* We shall add an event listener for all clicks on phone numbers. Notice
  that the clicks do not necessarily convert to a phone call, as the mobile
  usually asks for confirmation before calling */
  var telSelector = $("a[href^='tel:']");

  /* Number of clicks so far */
  var numberOfClicks = 0; 

  telSelector.click(function () {

    numberOfClicks++;

    var phoneNumber = $(this).attr('href');

    if (debugMode)
      console.log(' -> Clicked on ' + phoneNumber);

    /* Consider only phone numbers that match the given include pattern */
    if (regexIncludePattern) {
      var includeRegex = new RegExp(regexIncludePattern, 'g');
      if (phoneNumber.search(includeRegex) < 0) {
        if (debugMode)
          console.log(' -> User provided inclusion pattern (' + regexIncludePattern + ') not matched, ignoring click');
        return false;
      }
    }

    /* Do not consider phone numbers that match the given exclude pattern */
    if (regexExcludePattern) {
      var excludeRegex = new RegExp(regexExcludePattern, 'g');
      if (phoneNumber.search(excludeRegex) >= 0) {
        if (debugMode)
          console.log(' -> User provided exclusion pattern (' + regexExcludePattern + ') matched, ignoring click');
        return false;
      }
    }

    /* Send to GA an event, using the phone number as the event action.
    In order to avoid spurious events due to inconsistent naming conventions,
    we strip all delimiters from the phone number before sending the event */
    var delimitersPattern = '[' + RegExp.escape (delimiters.join('')) + ']';
    var delimitersRegex = new RegExp(delimitersPattern, 'g');
    
    /* For the same reason, we also strip any 00 or + symbol from the beginning
    of the phone number */
    var prefixPattern = '(00|\\+)';
    var prefixRegex = new RegExp(prefixPattern, 'g');
    var strippedPhoneNumber = phoneNumber.replace(delimitersRegex,'').replace(prefixRegex,'');

    /* Send the event, attaching phone number & page information. Do so only
    if the user hasn't already clicked on the phone number before. */
    if (numberOfClicks == 1) {
      ga('send', 'event', 'Contact', strippedPhoneNumber, pageTitle);
      if (debugMode)
        console.log(' -> Sent click event for ' + phoneNumber + ' (-> ' + strippedPhoneNumber + ')');
    }
    else {
      if (debugMode)
        console.log(' -> Ignored click event #' + numberOfClicks + ' for ' + phoneNumber);
    }

  });


  // ==========================================================================
  // =                            Find phone numbers                          =
  // ==========================================================================

  if (detectPhoneNumbers) {

    /* TODO: Implement automatic detection of phone numbers */
    
  }


  /**
   * Function to automatically escape special characters in regex patterns;
   * thanks to bobince on http://stackoverflow.com/a/3561711/2972183
   */

  RegExp.escape = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  };


}); // $(document).imagesLoaded

