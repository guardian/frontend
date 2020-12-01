
import qwery from "qwery";
import fastdom from "fastdom";
import $ from "lib/$";

class HostedCarousel {

  $carousel: Object;
  $nextItem: Object;
  $prevItem: Object;
  $dots: Object;
  pageCount: number;
  index: number;

  moveCarouselBy(direction: number) {
    this.moveCarouselTo(this.index + direction);
  }

  moveCarouselTo(index: number) {
    const pageNo = Math.min(Math.max(index, 0), this.pageCount - 1);
    this.index = pageNo;

    fastdom.mutate(() => {
      const translate = `translate(-${pageNo}00%, 0)`;
      this.$carousel.css({
        '-webkit-transform': translate,
        transform: translate
      });
      this.$dots.each((el, i) => {
        $(el).toggleClass('highlighted', i % this.pageCount === pageNo);
      });
      this.$prevItem.css({
        opacity: pageNo === 0 ? 0.5 : 1
      });
      this.$nextItem.css({
        opacity: pageNo === this.pageCount - 1 ? 0.5 : 1
      });
    });
  }

  bindButtons() {
    this.$carousel = $('.js-carousel-pages');
    this.$nextItem = $('.next-oj-item');
    this.$prevItem = $('.prev-oj-item');
    this.$dots = $('.js-carousel-dot');
    this.pageCount = $('.carousel-page', this.$carousel).length;
    this.index = 0;

    if (this.$carousel.length) {
      this.$nextItem.each(el => {
        el.addEventListener('click', this.moveCarouselBy.bind(this, 1));
      });
      this.$prevItem.each(el => {
        el.addEventListener('click', this.moveCarouselBy.bind(this, -1));
      });
      this.$dots.each((el, i) => {
        el.addEventListener('click', this.moveCarouselTo.bind(this, i % this.pageCount));
      });
    }
  }
}

export const initHostedCarousel = (): Promise<any> => {
  if (qwery('.js-carousel-pages').length) {
    new HostedCarousel().bindButtons();
  }
  return Promise.resolve();
};