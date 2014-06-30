define([
    'common/utils/$',
    'bean',
    'common/utils/storage',
    'common/modules/userPrefs',
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
        this.type = opts.type || 'banner';
        this.prefs = 'messages';
    };

    Message.prototype.show = function(message) {
        // don't let messages unknowingly overwrite each other
        if ((!$('.site-message').hasClass('is-hidden') && !this.important) || this.hasSeen()) {
            return false;
        }
        $('.js-site-message-copy').html(message);
        $('.site-message').addClass('site-message--' + this.type).addClass('site-message--' +  this.id);
        $('.site-message').removeClass('is-hidden');
        if (this.permanent) {
            $('.site-message').addClass('site-message--permanent');
            $('.site-message__close').addClass('is-hidden');
        } else {
            bean.on(document, 'click', '.js-site-message-close', this.acknowledge.bind(this));
        }
        if(this.type === 'modal') { this.bindModalListeners(); }
    };

    Message.prototype.bindModalListeners = function() {
        bean.on(document, 'click', '.js-site-message-inner', function(e) {
            // Suppress same-level and parent handling, but allow default click behaviour.
            // This handler must come first.
            e.stopImmediatePropagation();
            e.stopPropagation();
        });
        bean.on(document, 'click', '.js-site-message', this.acknowledge.bind(this));
    };

    Message.prototype.hide = function() {
        $('#header').removeClass('js-site-message');
        $('.site-message').addClass('is-hidden');
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
