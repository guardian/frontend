import qwery from 'qwery';
import fastdom from 'fastdom';
import Promise from 'Promise';
import $ from 'lib/$';

function HostedCarousel() {

}

HostedCarousel.prototype.moveCarouselBy = function(direction) {
    this.moveCarouselTo(this.index + direction);
};

HostedCarousel.prototype.moveCarouselTo = function(index) {
    var that = this;
    var pageNo = Math.min(Math.max(index, 0), this.pageCount - 1);
    this.index = pageNo;

    fastdom.write(function() {
        var translate = 'translate(-' + pageNo + '00%, 0)';
        that.$carousel.css({
            '-webkit-transform': translate,
            'transform': translate
        });
        that.$dots.each(function(el, i) {
            $(el).toggleClass('highlighted', (i % that.pageCount) === pageNo);
        });
        that.$prevItem.css({
            opacity: pageNo === 0 ? 0.5 : 1
        });
        that.$nextItem.css({
            opacity: pageNo === that.pageCount - 1 ? 0.5 : 1
        });
    });
};

HostedCarousel.prototype.bindButtons = function() {
    this.$carousel = $('.js-carousel-pages');
    this.$nextItem = $('.next-oj-item');
    this.$prevItem = $('.prev-oj-item');
    this.$dots = $('.js-carousel-dot');
    this.pageCount = $('.carousel-page', this.$carousel).length;
    this.index = 0;

    if (this.$carousel.length) {
        var that = this;
        this.$nextItem.each(function(el) {
            el.addEventListener('click', that.moveCarouselBy.bind(that, 1));
        });
        this.$prevItem.each(function(el) {
            el.addEventListener('click', that.moveCarouselBy.bind(that, -1));
        });
        this.$dots.each(function(el, i) {
            el.addEventListener('click', that.moveCarouselTo.bind(that, i % that.pageCount));
        });
    }

};

function init() {
    if (qwery('.js-carousel-pages').length) {
        new HostedCarousel().bindButtons();
    }
    return Promise.resolve();
}

export default {
    init: init,
    HostedCarousel: HostedCarousel
};
