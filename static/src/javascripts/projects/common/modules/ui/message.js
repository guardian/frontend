// @flow
import $ from 'lib/$';
import { noop } from 'lib/noop';
import bean from 'bean';
import userPrefs from 'common/modules/user-prefs';
import mediator from 'lib/mediator';
import { isBreakpoint } from 'lib/detect';
import { begin } from 'common/modules/analytics/register';
import uniq from 'lodash/arrays/uniq';

/**
 * Message provides a common means of flash messaging a user in the UI.
 *
 * @constructor
 * @param {String} id Identifier of the message
 * @param {Object=} options
 */
class Message {
    id: string;
    important: boolean;
    permanent: boolean;
    blocking: boolean;
    trackDisplay: boolean;
    type: string;
    pinOnHide: boolean;
    siteMessageComponentName: string;
    siteMessageLinkName: string;
    siteMessageCloseBtn: string;
    prefs: string;
    widthBasedMessage: boolean;
    cssModifierClass: string;
    customJs: Object => void;
    customOpts: Object;
    $siteMessage: Object;
    $siteMessageContainer: Object;
    $siteMessageOverlay: Object;
    $footerMessage: Object;

    constructor(id: string, options?: Object) {
        const opts = options || {};
        this.id = id;
        this.important = opts.important || false;
        this.permanent = opts.permanent || false;
        this.blocking = opts.blocking || false;
        this.trackDisplay = opts.trackDisplay || false;
        this.type = opts.type || 'banner';
        this.pinOnHide = opts.pinOnHide || false;
        this.siteMessageComponentName = opts.siteMessageComponentName || '';
        this.siteMessageLinkName = opts.siteMessageLinkName || '';
        this.siteMessageCloseBtn = opts.siteMessageCloseBtn || '';
        this.prefs = 'messages';
        this.widthBasedMessage = opts.widthBasedMessage || false;
        this.cssModifierClass = opts.cssModifierClass || '';
        this.customJs = opts.customJs || noop;
        this.customOpts = opts.customOpts || {};
        this.$footerMessage = $('.js-footer-message');
        this.$siteMessageContainer = $('.js-site-message');
        this.$siteMessageOverlay = $('.js-site-message-overlay');
    }

    show(message: string): boolean {
        if (this.pinOnHide) {
            $('.js-footer-site-message-copy').html(message);
        }

        // don't let messages unknowingly overwrite each other
        if (
            (!this.$siteMessageContainer.hasClass('is-hidden') &&
                !this.important) ||
            this.hasSeen()
        ) {
            // if we're not showing a banner message, display it in the footer
            if (this.pinOnHide) {
                this.$footerMessage.removeClass('is-hidden');
            }
            return false;
        }
        $('.js-site-message-copy').html(message);

        // Add a blocking overlay if needed
        if (this.blocking) {
            this.$siteMessageOverlay.removeClass('is-hidden');
            this.$siteMessageOverlay[0].addEventListener('click', () => {
                this.$siteMessageContainer[0].focus();
            });
            this.$siteMessageOverlay[0].addEventListener('focus', () => {
                this.$siteMessageContainer[0].focus();
            });
            this.trapFocus();
        }

        // Add site modifier message
        if (this.cssModifierClass) {
            this.$siteMessageContainer.addClass(
                `site-message--${this.cssModifierClass}`
            );
        }

        this.$siteMessage = $('.js-site-message__message');

        // Check and show the width based message
        this.updateMessageOnWidth();
        mediator.on(
            'window:throttledResize',
            this.updateMessageOnWidth.bind(this)
        );

        if (this.siteMessageComponentName) {
            this.$siteMessageContainer.attr(
                'data-component',
                this.siteMessageComponentName
            );
            if (this.trackDisplay) {
                begin(this.siteMessageComponentName);
            }
        }
        if (this.siteMessageLinkName) {
            this.$siteMessageContainer.attr(
                'data-link-name',
                this.siteMessageLinkName
            );
        }
        if (this.siteMessageCloseBtn) {
            $('.site-message__close-btn', '.js-site-message').attr(
                'data-link-name',
                this.siteMessageCloseBtn
            );
        }

        this.$siteMessageContainer
            .addClass(`site-message--${this.type}`)
            .addClass(`site-message--${this.id}`);
        this.$siteMessageContainer.removeClass('is-hidden');
        if (this.permanent) {
            this.$siteMessageContainer.addClass('site-message--permanent');
            $('.site-message__close').addClass('is-hidden');
        } else {
            bean.on(
                document,
                'click',
                '.js-site-message-close',
                this.acknowledge.bind(this)
            );
        }

        this.customJs(this.customOpts);

        if (this.type === 'modal') {
            this.bindModalListeners();
        }

        // Tell the calling function that our message is shown
        return true;
    }

    bindModalListeners(): void {
        bean.on(document, 'click', '.js-site-message-inner', e => {
            // Suppress same-level and parent handling, but allow default click behaviour.
            // This handler must come first.
            e.stopImmediatePropagation();
            e.stopPropagation();
        });
        bean.on(
            document,
            'click',
            '.js-site-message',
            this.acknowledge.bind(this)
        );
    }

    trapFocus(): void {
        const messageEl = this.$siteMessageContainer[0];
        const trapEndEl = document.createElement('div');

        trapEndEl.tabIndex = 0;

        trapEndEl.addEventListener('focus', () => {
            messageEl.focus();
        });

        messageEl.append(trapEndEl);
        messageEl.focus();
    }

    hide(): void {
        $('#header').removeClass('js-site-message');
        $('.js-site-message').addClass('is-hidden');
        $('.js-site-message-overlay').addClass('is-hidden');
        if (this.pinOnHide) {
            this.$footerMessage.removeClass('is-hidden');
        }
    }

    hasSeen(): boolean {
        const messageStates = userPrefs.get(this.prefs);
        return messageStates && messageStates.indexOf(this.id) > -1;
    }

    remember(): void {
        const messageStates = userPrefs.get(this.prefs) || [];
        messageStates.push(this.id);
        userPrefs.set(this.prefs, uniq(messageStates));
    }

    acknowledge(): void {
        this.remember();
        this.hide();
    }

    updateMessageOnWidth(): void {
        const narrowDataAttr = 'site-message-narrow';
        const wideDataAttr = 'site-message-wide';

        if (
            this.widthBasedMessage &&
            this.$siteMessage &&
            this.$siteMessage.length
        ) {
            this.updateMessageFromData(
                isBreakpoint({
                    max: 'tablet',
                })
                    ? narrowDataAttr
                    : wideDataAttr
            );
        }
    }

    updateMessageFromData(dataAttr: string): void {
        if (this.$siteMessage) {
            const message = this.$siteMessage.data(dataAttr);
            if (message && this.$siteMessage) {
                this.$siteMessage.text(message);
            }
        }
    }
}

export { Message };
