define([
    'common',
    'bean',
    'bonzo'
], function(common, bean, bonzo) {

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
        bean.on(window, 'scroll', function(){
            common.requestAnimationFrame(function(){
                self.checkPosition.call(self);
            });
        });
    };

    Sticky.prototype.checkPosition = function () {
        var scrollTop = bonzo(document.body).scrollTop();

        if(scrollTop > this.top) {
            bonzo(this.el).addClass(this.options.affixCls);
        } else {
            bonzo(this.el).removeClass(this.options.affixCls);
        }

    };

    return Sticky;
});
