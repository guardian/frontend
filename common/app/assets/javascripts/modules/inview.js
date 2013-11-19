define([
    "utils/mediator",
    'utils/to-array',
    'utils/request-animation-frame',
    "bean"
], function (
    mediator,
    toArray,
    requestAnimationFrame,
    bean
) {

    function Inview(selector, context) {
        var self = this;

        this.selector = selector || '.js-inview';
        this.context  = context || document;
        this.refresh();
        this.checkForVisibleNodes();

        mediator.addListener('window:scroll', function() {
            requestAnimationFrame(function(){
                self.checkForVisibleNodes();
            });
        });
    }


    Inview.prototype.refresh = function() {
        this.inviewNodes = toArray(this.context.querySelectorAll(this.selector));
    };

    Inview.prototype.checkForVisibleNodes = function() {
        var self = this;
        this.inviewNodes.forEach(function(el) {
            if (!el._inviewHasFired && self.isVisible(el)) {
                // Element is visible
                bean.fire(el, 'inview');
                mediator.emit('modules:inview:visible', el);
                el._inviewHasFired = true;
            }
        });
    };

    Inview.prototype.isVisible = function(el) {
        var rect = el.getBoundingClientRect();
        return el.style.display !== 'none' &&
               rect.top < (window.innerHeight || document.body.clientHeight) &&
               rect.left < (window.innerWidth || document.body.clientWidth);
    };

    return Inview;
});
