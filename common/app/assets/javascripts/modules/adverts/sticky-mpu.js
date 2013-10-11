define([
    'common',
    'bean',
    'bonzo'
], function(common, bean, bonzo) {

    var StickyMpu = function (options) {
        this.options = common.extend(this.DEFAULTS, options);
        this.el = this.options.context.getElementsByClassName(this.options.cls)[0];
        this.$el = bonzo(this.el);
        this.top =  bonzo(this.options.context.querySelector(".js-mpu-upper[data-id=" + this.options.id + "]")).offset().top;
        this.bottom = bonzo(this.options.context.querySelector(".js-mpu-lower[data-id=" + this.options.id + "]")).offset().top - 250;
        this.bindListeners();
    };

    StickyMpu.prototype.DEFAULTS = {
        context: document,
        cls: 'ad-slot-mpu-banner-ad',
        id: 'x07'
    };

    StickyMpu.prototype.bindListeners = function () {
        var self = this;
        bean.on(window, 'scroll', function(){
            self.checkPosition.call(self);
        });
    };

    StickyMpu.prototype.checkPosition = function () {
        var scrollTop = bonzo(document.body).scrollTop(),
            self = this;

        if(scrollTop > this.top) {
            common.requestAnimationFrame(function(){
                self.setPosition.call(self, scrollTop);
            });
        }
    };

    StickyMpu.prototype.setPosition = function (scrollTop) {
        var offset  = scrollTop - this.top;
        if(scrollTop < this.bottom) {
            bonzo(this.el).css("transform", "translate(0, " + offset +"px)");
        }
    };

    return StickyMpu;
});
