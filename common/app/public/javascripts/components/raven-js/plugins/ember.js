/**
 * Ember.js plugin
 *
 * Patches event handler callbacks and ajax callbacks.
 */
;(function(window, Raven, Ember) {
'use strict';

// quit if Ember isn't on the page
if (!Ember) {
    return;
}

var _oldOnError = Ember.onerror;
Ember.onerror = function EmberOnError(error) {
    Raven.captureException(error);
    if (typeof _oldOnError === 'function') {
        _oldOnError.call(this, error);
    }
};


}(this, Raven, window.Ember));
