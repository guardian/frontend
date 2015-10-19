define([
    'common/utils/$',
    'bean',
    'common/utils/storage',
    'common/modules/user-prefs',
    'common/utils/_',
    'common/utils/mediator',
    'common/utils/detect'
], function (
    $,
    bean,
    storage,
    userPrefs,
    _,
    mediator,
    detect
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
        this.widthBasedMessage = opts.widthBasedMessage || false;

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

        this.$siteMessageNarrow = $('.js-site-message__narrow');
        this.$siteMessageWide = $('.js-site-message__wide');

        // Check and show the width based message
        this.updateMessageOnWidth();
        mediator.on('window:resize', _.debounce(this.updateMessageOnWidth, 200).bind(this));

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

    Message.prototype.updateMessageOnWidth = function () {
        if (this.widthBasedMessage && this.$siteMessageNarrow.length && this.$siteMessageWide.length) {
            (detect.isBreakpoint({ max: 'tablet' })) ? this.showNarrowMessage() : this.showWideMessage();
        }
    };

    Message.prototype.showNarrowMessage = function () {
        this.$siteMessageWide.addClass('is-hidden');
        this.$siteMessageNarrow.removeClass('is-hidden');
    };

    Message.prototype.showWideMessage = function () {
        this.$siteMessageNarrow.addClass('is-hidden');
        this.$siteMessageWide.removeClass('is-hidden');
    };

    return Message;
});
