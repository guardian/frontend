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
        this.isSticky = false;
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
        fastdom.read(this.updatePosition, this);
    };

    Sticky.prototype.updatePosition = function updatePosition() {
        var parentRect = this.element.parentNode.getBoundingClientRect();
        var elementHeight = this.element.offsetHeight;
        var css, message;

        // have we scrolled past the element
        if (parentRect.top < this.opts.top + paidforBandHeight) {
            // make sure the element stays within its parent
            if (this.opts.containInParent && parentRect.bottom < this.opts.top + elementHeight) {
                var fixedTop = Math.floor(parentRect.bottom - elementHeight - this.opts.top);
                css = { position: 'fixed', top: fixedTop };
                message = 'fixed';
            } else if (!this.isSticky) {
                css = { position: 'fixed', top: this.opts.top };
                message = 'fixed';
            }
            this.isSticky = true;
        } else if (this.isSticky) {
            css = { position: 'static', top: 'auto' };
            message = 'unfixed';
            this.isSticky = false;
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
