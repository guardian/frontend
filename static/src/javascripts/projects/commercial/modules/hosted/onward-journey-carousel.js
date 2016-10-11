define([
    'bean',
    'fastdom',
    'Promise',
    'common/utils/$'
], function (
    bean,
    fastdom,
    Promise,
    $
) {

    function HostedCarousel() {

    }

    HostedCarousel.prototype.moveCarousel = function(direction) {
        var that = this;
        var pageNo = Math.min(Math.max(this.index + direction, 0), this.pageCount - 1);
        this.index = pageNo;

        fastdom.write(function () {
            var translate = 'translate(-' + pageNo + '00%, 0)';
            that.$carousel.css({
                '-webkit-transform': translate,
                'transform': translate
            });
            for(var i = 0; i < that.pageCount; i++){
                $('.js-carousel-dot-' + i).toggleClass('highlighted', i === pageNo);
            }
            that.$prevItem.css({
                opacity: pageNo === 0 ? 0.5 : 1
            });
            that.$nextItem.css({
                opacity: pageNo === that.pageCount - 1 ? 0.5 : 1
            });
        });
    };

    HostedCarousel.prototype.bindButtons = function() {
        this.$carousel = $('.js-carousel-wrapper');
        this.$nextItem = $('.next-oj-item');
        this.$prevItem = $('.prev-oj-item');
        this.pageCount = $('.carousel-page', this.$carousel).length;
        this.index = 0;

        if (this.$carousel.length) {
            var that = this;
            this.$nextItem.each(function(el){
                bean.on(el, 'click', that.moveCarousel.bind(that, 1));
            });
            this.$prevItem.each(function(el){
                bean.on(el, 'click', that.moveCarousel.bind(that, -1));
            });
        }

    };

    function init() {
        return new Promise(function(resolve) {
            new HostedCarousel().bindButtons();
            resolve();
        });
    }

    return {
        init: init,
        HostedCarousel: HostedCarousel
    };
});
