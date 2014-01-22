define([
    "common/$",
    "bean",
    "common/utils/storage",
    "common/modules/userPrefs",
    'lodash/arrays/uniq'
], function (
    $,
    bean,
    storage,
    userPrefs,
    uniq
) {

   /**
    * Message provides a common means of flash messaging a user in the UI.
    *
    * @constructor
    * @param {String} id Identifier of the message
    * @param {Object=} options
    */
    var Message = function(id, options) {
        var opts = options || {};
        this.id = id;
        this.important = opts.important || false;
        this.permanent = opts.permanent || false;
        this.prefs = 'messages';
    };

    Message.prototype.show = function(message) {
        // don't let messages unknowingly overwrite each other
        if ((!$('.site-message').hasClass('u-h') && !this.important) || this.hasSeen()) {
            return false;
        }
        $('.js-site-message-copy').html(message);
        $('#header').addClass('js-site-message');
        $('.site-message').removeClass('u-h');
        if (this.permanent) {
            $('.site-message').addClass('site-message--permanent');
            $('.site-message__close').addClass('u-h');
        } else {
            bean.on(document, 'click', '.js-site-message-close', this.acknowledge.bind(this));
        }
    };

    Message.prototype.hide = function() {
        $('#header').removeClass('js-site-message');
        $('.site-message').addClass('u-h');
    };

    Message.prototype.hasSeen = function() {
        var messageStates = userPrefs.get(this.prefs);
        return messageStates && messageStates.indexOf(this.id) > -1;
    };

    Message.prototype.remember = function() {
        var messageStates = userPrefs.get(this.prefs) || [];
        messageStates.push(this.id);
        userPrefs.set(this.prefs, uniq(messageStates));
    };

    Message.prototype.acknowledge = function() {
        this.remember();
        this.hide();
    };

    return Message;
});
