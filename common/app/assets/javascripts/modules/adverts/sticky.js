define([
    'common',
    'modules/detect',
    'bean',
    'bonzo'
], function(common, detect,  bean, bonzo) {

    var Sticky = function (options) {
        this.options = common.extend(this.DEFAULTS, options);
        this.el = this.options.context.getElementsByClassName(this.options.elCls)[0];
        this.$el = bonzo(this.el);
        this.top =  bonzo(this.options.context.querySelector(".js-sticky-upper[data-id=" + this.options.id + "]")).offset().top;
        this.bottom = bonzo(this.options.context.querySelector(".js-sticky-lower[data-id=" + this.options.id + "]")).offset().top - 250;
        this.bindListeners();
    };

    Sticky.prototype.DEFAULTS = {
        context: document,
        elCls: 'ad-slot--mpu-banner-ad',
        affixCls: 'is-affixed',
        id: 'Middle1'
    };

    Sticky.prototype.bindListeners = function () {
        var self = this;

        var e = detect.hasTouchScreen() ? 'touchmove' : 'scroll';
        bean.on(window, 'scroll', function(){
            common.requestAnimationFrame(function(){
                self.checkPosition.call(self);
            });
        });
    };

    Sticky.prototype.checkPosition = function () {
        var scrollTop = bonzo(document.body).scrollTop();

        if(scrollTop > this.top && scrollTop < this.bottom) {
            this.el.classList.add(this.options.affixCls);
        } else {
            this.el.classList.remove(this.options.affixCls);
        }

    };

    return Sticky;
});
