import config from 'lib/config';
import mediator from 'lib/mediator';
import fastdom from 'fastdom';
import defaults from 'lodash/objects/defaults';

/**
 * @todo: check if browser natively supports "position: sticky"
 */
function Sticky(element, options) {
    this.element = element;
    this.opts = defaults(options || {}, {
        top: 0,
        containInParent: true,
        emitMessage: false
    });
}

Sticky.prototype.init = function init() {
    fastdom.read(function() {
        this.offsetFromParent = this.element.getBoundingClientRect().top - this.element.parentNode.getBoundingClientRect().top;
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
    if (0 < parentRect.top + this.offsetFromParent) {
        stick = false;
        css = {
            top: null
        };
        message = 'unfixed';
    } else {
        stick = true;
        var top = this.opts.containInParent && parentRect.bottom <= elementRect.height ?
            Math.floor(parentRect.bottom - elementHeight - this.opts.top) :
            this.opts.top;
        css = {
            top: top + 'px'
        };
        message = 'fixed';
    }

    if (this.opts.emitMessage && message && message !== this.lastMessage) {
        this.emitMessage(message);
        this.lastMessage = message;
    }

    if (css) {
        fastdom.write(function() {
            if (stick) {
                this.element.classList.add('is-sticky');
                Object.assign(this.element.style, css);
            } else {
                this.element.classList.remove('is-sticky');
                Object.assign(this.element.style, css);
            }
        }, this);
    }
};

Sticky.prototype.emitMessage = function emitMessage(message) {
    mediator.emit('modules:' + this.element.id + ':' + message);
};

export default Sticky;
