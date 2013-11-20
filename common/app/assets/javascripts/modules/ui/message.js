define([
    "$",
    "bean",
    "utils/storage",
    "modules/userPrefs"
], function (
    $,
    bean,
    storage,
    userPrefs
) {

   /**
    * Message provides a common means of flash messaging a user in the UI.
    *
    * @constructor
    * @param {String} id Identifier of the message
    * @param {Object=} options
    */
    var Message = function(id, options) {
        var self = this,
            opts = options || {};
        this.important = opts.important || false;
        this.prefs = 'message.' + id;
        bean.on(document, 'click', '.js-site-message-close', function(e) {
            self.acknowledge();
        });
    };

    Message.prototype.show = function(message) {
        // don't let messages unknowingly overwrite each other
        if (!$('.site-message').hasClass('u-h') && !this.important) {
            return false;
        }
        $('.js-site-message-copy').html(message);
        $('#header').addClass('js-site-message');
        $('.site-message').removeClass('u-h');
    };
    
    Message.prototype.hide = function() {
        $('#header').removeClass('js-site-message');
        $('.site-message').addClass('u-h');
    };
    
    Message.prototype.hasSeen = function() {
        return !!userPrefs.get(this.prefs);
    };

    Message.prototype.remember = function() {
        userPrefs.set(this.prefs, true);
    };
    
    Message.prototype.acknowledge = function() {
        this.remember();
        this.hide();
    };
    
    return Message;
});
