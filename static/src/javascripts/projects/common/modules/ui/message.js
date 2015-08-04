define([
    'common/utils/$',
    'bean',
    'common/utils/storage',
    'common/modules/user-prefs',
    'common/utils/_'
], function (
    $,
    bean,
    storage,
    userPrefs,
    _
) {

    /**
     * Message provides a common means of flash messaging a user in the UI.
     *
     * @constructor
     * @param {String} id Identifier of the message
     * @param {Object=} options
     */
    var Message = function (id, options) {
        var opts = options || {};
        this.id = id;
        this.important = opts.important || false;
        this.permanent = opts.permanent || false;
        this.type = opts.type || 'banner';
        this.pinOnHide = opts.pinOnHide || false;
        this.siteMessageLinkName = opts.siteMessageLinkName || '';
        this.siteMessageCloseBtn = opts.siteMessageCloseBtn || '';
        this.prefs = 'messages';

        this.$footerMessage = $('.js-footer-message');
    };

    Message.prototype.show = function (message) {
        var siteMessage = $('.js-site-message');

        if (this.pinOnHide) {
            $('.js-footer-site-message-copy').html(message);
        }

        // don't let messages unknowingly overwrite each other
        if ((!siteMessage.hasClass('is-hidden') && !this.important) || this.hasSeen()) {
            // if we're not showing a banner message, display it in the footer
            if (this.pinOnHide) {
                this.$footerMessage.removeClass('is-hidden');
            }
            return false;
        }
        $('.js-site-message-copy').html(message);

        if (this.siteMessageLinkName) {
            siteMessage.attr('data-link-name', this.siteMessageLinkName);
        }
        if (this.siteMessageCloseBtn) {
            $('.site-message__close-btn', '.js-site-message').attr('data-link-name', this.siteMessageCloseBtn);
        }

        siteMessage.addClass('site-message--' + this.type).addClass('site-message--' +  this.id);
        siteMessage.removeClass('is-hidden');
        if (this.permanent) {
            siteMessage.addClass('site-message--permanent');
            $('.site-message__close').addClass('is-hidden');
        } else {
            bean.on(document, 'click', '.js-site-message-close', this.acknowledge.bind(this));
        }
        if (this.type === 'modal') { this.bindModalListeners(); }
    };

    Message.prototype.bindModalListeners = function () {
        bean.on(document, 'click', '.js-site-message-inner', function (e) {
            // Suppress same-level and parent handling, but allow default click behaviour.
            // This handler must come first.
            e.stopImmediatePropagation();
            e.stopPropagation();
        });
        bean.on(document, 'click', '.js-site-message', this.acknowledge.bind(this));
    };

    Message.prototype.hide = function () {
        $('#header').removeClass('js-site-message');
        $('.js-site-message').addClass('is-hidden');
        if (this.pinOnHide) {
            this.$footerMessage.removeClass('is-hidden');
        }
    };

    Message.prototype.hasSeen = function () {
        var messageStates = userPrefs.get(this.prefs);
        return messageStates && messageStates.indexOf(this.id) > -1;
    };

    Message.prototype.remember = function () {
        var messageStates = userPrefs.get(this.prefs) || [];
        messageStates.push(this.id);
        userPrefs.set(this.prefs, _.uniq(messageStates));
    };

    Message.prototype.acknowledge = function () {
        this.remember();
        this.hide();
    };

    return Message;
});
