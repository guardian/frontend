/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import fastdom from 'fastdom';
import { $$ } from '../../../../lib/$$';

interface HostedCarousel {
	index: number;
	pageCount: number;
	carousel: ReturnType<typeof $$>;
	dots: ReturnType<typeof $$>;
	prevItem: ReturnType<typeof $$>;
	nextItem: ReturnType<typeof $$>;
}

class HostedCarousel {
	moveCarouselBy(direction: number) {
		this.moveCarouselTo(this.index + direction);
	}

	moveCarouselTo(index: number) {
		const pageNo = Math.min(Math.max(index, 0), this.pageCount - 1);
		this.index = pageNo;

		fastdom.mutate(() => {
			const translate = `translate(-${pageNo}00%, 0)`;
			this.carousel.css({
				transform: translate,
			});
			this.dots.get().forEach((el, i) => {
				el.classList.toggle(
					'highlighted',
					i % this.pageCount === pageNo,
				);
			});
			this.prevItem.css({
				opacity: pageNo === 0 ? 0.5 : 1,
			});
			this.nextItem.css({
				opacity: pageNo === this.pageCount - 1 ? 0.5 : 1,
			});
		});
	}

	bindButtons() {
		this.carousel = $$('.js-carousel-pages');
		this.nextItem = $$('.next-oj-item');
		this.prevItem = $$('.prev-oj-item');
		this.dots = $$('.js-carousel-dot');
		this.pageCount = $$(
			'.carousel-page',
			this.carousel.get(0),
		).get().length;
		this.index = 0;

		if (this.carousel.get().length) {
			this.nextItem.get().forEach((el) => {
				el.addEventListener('click', this.moveCarouselBy.bind(this, 1));
			});
			this.prevItem.get().forEach((el) => {
				el.addEventListener(
					'click',
					this.moveCarouselBy.bind(this, -1),
				);
			});
			this.dots.get().forEach((el, i) => {
				el.addEventListener(
					'click',
					this.moveCarouselTo.bind(this, i % this.pageCount),
				);
			});
		}
	}
}

export const initHostedCarousel = (): Promise<void> => {
	if ($$('.js-carousel-pages').get().length) {
		new HostedCarousel().bindButtons();
	}
	return Promise.resolve();
};
