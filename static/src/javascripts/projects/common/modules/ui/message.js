define([
    'common/utils/$',
    'bean',
    'common/utils/storage',
    'common/modules/user-prefs',
    'common/utils/mediator',
    'common/utils/detect',
    'lodash/functions/debounce',
    'lodash/arrays/uniq'
], function (
    $,
    bean,
    storage,
    userPrefs,
    mediator,
    detect,
    debounce,
    uniq) {

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
        this.widthBasedMessage = opts.widthBasedMessage || false;
        this.cssModifierClass = opts.cssModifierClass || false;

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

        // Add site modifier message
        if (this.cssModifierClass) {
            siteMessage.addClass('site-message--' + this.cssModifierClass);
        }

        this.$siteMessage = $('.js-site-message__message');

        // Check and show the width based message
        this.updateMessageOnWidth();
        mediator.on('window:resize', debounce(this.updateMessageOnWidth, 200).bind(this));

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

        // Tell the calling function that our message is shown
        return true;
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
        userPrefs.set(this.prefs, uniq(messageStates));
    };

    Message.prototype.acknowledge = function () {
        this.remember();
        this.hide();
    };

    Message.prototype.updateMessageOnWidth = function () {
        var narrowDataAttr = 'site-message-narrow',
            wideDataAttr = 'site-message-wide';

        if (this.widthBasedMessage && this.$siteMessage.length) {
            this.updateMessageFromData((detect.isBreakpoint({ max: 'tablet' })) ? narrowDataAttr : wideDataAttr);
        }
    };

    Message.prototype.updateMessageFromData = function (dataAttr) {
        var message = this.$siteMessage.data(dataAttr);
        if (message) {
            this.$siteMessage.text(message);
        }
    };

    return Message;
});
