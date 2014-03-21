define([
    'bean',
    'bonzo',
    'common/utils/mediator',
    'common/utils/request-animation-frame',
    'lodash/objects/assign'
], function(bean, bonzo, mediator, raf, extend) {

    var Affix = function (options) {
        var self = this;

        this.options = extend(Affix.DEFAULTS, options);
        this.$window = bonzo(document.body);

        mediator.on('window:scroll', function(){
            raf(function() {
                self.checkPosition.call(self);
            });
        });

        bean.on(window, 'click',  function() {
            self.checkPositionWithEventLoop.call(self);
        });

        this.$element = bonzo(options.element);
        this.affixed  = null;
        this.unpin    = null;

        this.checkPosition();
    };

    Affix.RESET = 'affix affix--top affix--bottom';

    Affix.DEFAULTS = {
        offset: 0
    };

    Affix.prototype.checkPositionWithEventLoop = function () {
        var self = this;
        raf(function(){
            self.checkPosition.call(self);
        });
    };

    Affix.prototype.checkPosition = function () {
        var scrollHeight = bonzo(document).dim().height,
            scrollTop    = this.$window.scrollTop(),
            position     = this.$element.offset(),
            offset       = this.options.offset,
            offsetTop    = offset.top,
            offsetBottom = offset.bottom;

        if (typeof offset !== 'object') { offsetBottom = offsetTop = offset; }
        if (typeof offsetTop === 'function') { offsetTop    = offset.top(); }
        if (typeof offsetBottom === 'function') { offsetBottom = offset.bottom(); }

        var affix = this.unpin   !== null && (scrollTop + this.unpin <= position.top) ? false :
            offsetBottom !== null && (position.top + this.$element.dim().height >= scrollHeight - offsetBottom) ? 'bottom' :
                offsetTop    !== null && (scrollTop <= offsetTop) ? 'top' : false;

        if (this.affixed === affix) { return; }
        if (this.unpin) { this.$element.css('top', ''); }

        this.affixed = affix;
        this.unpin   = affix === 'bottom' ? position.top - scrollTop : null;

        this.$element.removeClass(Affix.RESET);
        this.$element.addClass('affix' + (affix ? '--' + affix : ''));

        if (affix === 'bottom') {
            this.$element.offset({ top: document.body.offsetHeight - offsetBottom - this.$element.dim().height });
        }
    };

    return Affix;
});