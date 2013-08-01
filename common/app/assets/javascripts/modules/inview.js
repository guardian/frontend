define(["common", "bean", "bonzo"], function (common, bean, bonzo) {

    function Inview(selector, context) {
        var self = this;

        this.selector = selector || '.js-inview';
        this.context  = context || document;
        this.refresh();
        this.checkForVisibleNodes();

        bean.on(window, 'scroll', common.debounce(function() {
            self.checkForVisibleNodes();
        }, 200));
    }

    Inview.prototype.refresh = function() {
        this.inviewNodes = common.toArray(this.context.querySelectorAll(this.selector));
    };

    Inview.prototype.checkForVisibleNodes = function() {
        var visibleTop    = window.pageYOffset,
            visibleBottom = visibleTop + window.innerHeight;

        this.inviewNodes.forEach(function(el) {
            var offsetTop = bonzo(el).offset().top;

            if (!el._inviewHasFired &&
                el.style.display !== 'none' &&
                visibleTop <= offsetTop &&
                visibleBottom >= offsetTop) {
                    // Element is visible
                    bean.fire(el, 'inview');
                    common.mediator.emit('modules:inview:visible', el);
                    el._inviewHasFired = true;
            }
        });
    };

    return Inview;
});
