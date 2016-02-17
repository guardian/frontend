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
    defaults
) {

    var isNewCommercialContent = config.switches.newCommercialContent && config.page.isAdvertisementFeature;
    var paidforBandHeight;

    function initPFBand() {
        var paidforBand = document.querySelector('.paidfor-band');
        paidforBandHeight = 0;
        if (paidforBand) {
            fastdom.read(function () {
                paidforBandHeight = paidforBand.offsetHeight;
            });
        }
    }

    /**
     * @todo: check if browser natively supports "position: sticky"
     */
    function Sticky(element, options) {
        this.element  = element;
        this.parent   = element.parentNode;
        this.sticky   = false;
        this.bottom   = false;
        this.opts     = defaults(options || {}, {
            top: 0,
            containInParent: true,
            emitMessage: false
        });
    }

    Sticky.prototype.init = function init() {
        if (paidforBandHeight === undefined) {
            initPFBand();
        }
        mediator.on('window:throttledScroll', this.updatePosition.bind(this));
        // kick off an initial position update
        fastdom.read(this.initGeometry, this);
        fastdom.read(this.updatePosition, this);
    };

    Sticky.prototype.initGeometry = function () {
        this.elementHeight = this.element.offsetHeight;
    };

    Sticky.prototype.updatePosition = function () {
        var fixedTop, css, stickyHeaderHeight, parentRect, message;

        stickyHeaderHeight = header && header !== this.element ? header.offsetHeight : 0;
        parentRect = this.parent.getBoundingClientRect();

        // have we scrolled past the element
        if (parentRect.top < this.opts.top + paidforBandHeight) {
            // make sure the element stays within its parent
            fixedTop = Math.floor(Math.min(this.opts.top, parentRect.bottom - this.elementHeight));
            if (this.opts.containInParent && this.sticky && fixedTop < this.opts.top) {
                css = { top: fixedTop };
                this.bottom = true;
                message = 'fixed';
            } else if (!this.sticky || this.bottom) {
                css = this.stickyCss;
                this.sticky = true;
                this.bottom = false;
                message = 'fixed';
            }
        } else {
            if (this.sticky) {
                css = this.unstickyCss;
                this.sticky = false;
                this.bottom = false;
                message = 'unfixed';
            }
        }

        if (this.opts.emitMessage && message && message !== this.lastMessage) {
            this.emitMessage(message);
        }

        this.lastMessage = message;

        if (css) {
            fastdom.write(function () {
                bonzo(this.element).css(css);
            }, this);
        }
    };

    Sticky.prototype.emitMessage = function emitMessage(message) {
        mediator.emit('modules:' + this.element.id + ':' + message);
    };

    return Sticky;

});
