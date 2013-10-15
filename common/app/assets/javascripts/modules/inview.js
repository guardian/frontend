define(["common", "bean"], function (common, bean) {

    function Inview(selector, context, offset) {
        var self = this;

        this.selector = selector || '.js-inview';
        this.context  = context || document;
        this.offset = offset || { top: 0, left: 0 };
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
        var self = this;
        this.inviewNodes.forEach(function(el) {
            if (!el._inviewHasFired && self.isVisible(el)) {
                // Element is visible
                bean.fire(el, 'inview');
                common.mediator.emit('modules:inview:visible', el);
                el._inviewHasFired = true;
            }
        });
    };

    Inview.prototype.isVisible = function(el) {
        var rect = el.getBoundingClientRect(),
            h = window.innerHeight || document.body.clientHeight,
            w = window.innerWidth || document.body.clientWidth;

        return el.style.display !== 'none' &&
               rect.top < (h - this.offset.top) &&
               rect.left < (w - this.offset.left);
    };

    return Inview;
});
