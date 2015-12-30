define([
    'bonzo',
    'common/utils/config',
    'common/utils/mediator',
    'fastdom',
    'lodash/objects/defaults'
], function (
    bonzo,
    config,
    mediator,
    fastdom,
    defaults) {

    var header = config.switches.viewability
        && !(config.page.isProd && config.page.contentType === 'Interactive')
        && config.page.contentType !== 'Crossword'
        && (!config.switches.newCommercialContent || !config.page.isAdvertisementFeature)
        && config.page.pageId !== 'offline-page' ?
        document.querySelector('.js-navigation') :
        config.switches.newCommercialContent && config.page.isAdvertisementFeature ?
        document.querySelector('.paidfor-band') :
        null;

    /**
     * @todo: check if browser natively supports "position: sticky"
     */
    var Sticky = function (element, options) {
        this.element  = element;
        this.parent   = element.parentNode;
        this.sticky   = false;
        this.bottom   = false;
        this.opts     = defaults(options || {}, {
            top: 0
        });
        this.stickyCss = { position: 'fixed', top: this.opts.top };
        this.unstickyCss = { position: null, top: null };
    };

    Sticky.prototype.init = function () {
        mediator.on('window:throttledScroll', this.updatePosition.bind(this));
        // kick off an initial position update
        fastdom.read(this.initGeometry, this);
        fastdom.read(this.updatePosition, this);
    };

    Sticky.prototype.initGeometry = function() {
        this.elementHeight = this.element.offsetHeight;
    }

    Sticky.prototype.updatePosition = function () {
        var fixedTop, css, stickyHeaderHeight, elementRect;

        stickyHeaderHeight = header && header !== this.element ? header.offsetHeight : 0;
        parentRect = this.parent.getBoundingClientRect();

        // have we scrolled past the element
        if (parentRect.top < this.opts.top + stickyHeaderHeight) {
            // make sure the element stays within its parent
            fixedTop = Math.min(this.opts.top, parentRect.bottom - this.elementHeight);
            if (this.sticky && fixedTop < this.opts.top) {
                css = { top: fixedTop };
                this.bottom = true;
            } else if (!this.sticky || this.bottom) {
                css = this.stickyCss;
                this.sticky = true;
                this.bottom = false;
            }
        } else {
            if (this.sticky) {
                css = this.unstickyCss;
                this.sticky = false;
                this.bottom = false;
            }
        }

        if (css) {
            fastdom.write(function () {
                bonzo(this.element).css(css);
            }, this);
        }
    };

    return Sticky;

});
