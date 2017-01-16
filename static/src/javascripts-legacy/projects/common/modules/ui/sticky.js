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

    /**
     * @todo: check if browser natively supports "position: sticky"
     */
    function Sticky(element, options) {
        this.element  = element;
        this.sticks   = false;
        this.opts     = defaults(options || {}, {
            top: 0,
            containInParent: true,
            emitMessage: false
        });
    }

    Sticky.prototype.init = function init() {
        fastdom.read(function () {
            this.absolutePos = window.pageYOffset + this.element.getBoundingClientRect().top;
        }, this);
        mediator.on('window:throttledScroll', this.updatePosition.bind(this));
        // kick off an initial position update
        fastdom.read(this.updatePosition, this);
    };

    Sticky.prototype.updatePosition = function updatePosition() {
        var elementRect = this.element.getBoundingClientRect();
        var parentRect = this.element.parentNode.getBoundingClientRect();
        var elementHeight = elementRect.height;
        var css, message, stick;

        // have we scrolled past the element
        if (this.sticks) {
            if (window.pageYOffset < this.absolutePos) {
                stick = false;
                css = { top: null };
                message = 'unfixed';
            }
        } else {
            if (elementRect.top <= this.opts.top) {
                // make sure the element stays within its parent
                var fixedTop = this.opts.containInParent && parentRect.bottom < this.opts.top + elementHeight ?
                    Math.floor(parentRect.bottom - elementHeight - this.opts.top) :
                    this.opts.top;
                stick = true;
                css = { top: fixedTop };
                message = 'fixed';
            }
        }

        if (this.opts.emitMessage && message && message !== this.lastMessage) {
            this.emitMessage(message);
            this.lastMessage = message;
        }

        if (css) {
            fastdom.write(function () {
                this.sticks = stick;
                if (stick) {
                    bonzo(this.element).addClass('is-sticky').css(css);
                } else {
                    bonzo(this.element).removeClass('is-sticky').css(css);
                }
            }, this);
        }
    };

    Sticky.prototype.emitMessage = function emitMessage(message) {
        mediator.emit('modules:' + this.element.id + ':' + message);
    };

    return Sticky;

});
