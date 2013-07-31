define(["common", "bean", "bonzo"], function (common, bean, bonzo) {

    function Inview(context, selector) {
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
        this.inviewNodes = this.context.querySelectorAll(this.selector);
    };

    Inview.prototype.checkForVisibleNodes = function() {
        var visibleTop    = window.pageYOffset,
            visibleBottom = visibleTop + window.innerHeight;

        Array.prototype.forEach.call(this.inviewNodes, function(el) {
            //console.log(visibleTop, visibleBottom, el.offsetTop, bonzo(el).offset().top, el.getAttribute('data-link-name'));
            var offsetTop = bonzo(el).offset().top;

            if (!el._inviewHasFired &&
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
