// @flow
import fastdom from 'fastdom';
import $ from 'lib/$';
import template from 'lodash/utilities/template';
import adblockStickyMessage
    from 'raw-loader!common/views/commercial/adblock-sticky-message.html';
import adblockStickyMessageCoin
    from 'raw-loader!common/views/commercial/adblock-sticky-message-coin.html';

/**
 * Message which is shown at the top of the page to the adblock users.
 * @constructor
 */
class AdblockBanner {
    template: string;
    config: {};
    templates: {};

    constructor(templateToUse: string, config: {}) {
        this.template = templateToUse;
        this.config = config;

        this.templates = {
            'adblock-sticky-message': adblockStickyMessage,
            'adblock-sticky-message-coin': adblockStickyMessageCoin,
        };
    }

    renderTemplate() {
        return template(this.templates[this.template], this.config);
    }

    show() {
        const bannerTmpl = this.renderTemplate();

        fastdom.write(() => {
            $('.js-top-banner').after(bannerTmpl);
        });
    }
}

export { AdblockBanner };
