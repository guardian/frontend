import config from '../../../lib/config';
import fastdom from '../../../lib/fastdom-promise';
import { mediator } from '../../../lib/mediator';
import { Sticky } from '../../common/modules/ui/sticky';
import { register, unregister } from './messenger';

const noSticky = document.documentElement.classList.contains('has-no-sticky');

let stickyElement: Sticky;
let stickySlot: HTMLElement;

const onResize = (specs: unknown, _: unknown, iframe?: HTMLElement) => {
	if (iframe && stickySlot.contains(iframe)) {
		unregister('resize', onResize);
		stickyElement.updatePosition();
	}
};

const isStickyMpuSlot = (adSlot: HTMLElement) => {
	const dataName = adSlot.dataset.name;
	return dataName === 'comments' || dataName === 'right';
};

const stickyCommentsMpu = (adSlot: HTMLElement): Promise<void> => {
	if (isStickyMpuSlot(adSlot)) {
		stickySlot = adSlot;
	}

	const referenceElement =
		document.querySelector<HTMLElement>('.js-comments');

	if (!referenceElement) {
		return Promise.resolve();
	}

	return fastdom
		.measure(() => referenceElement.offsetHeight - 600)
		.then((newHeight) =>
			fastdom.mutate(() => {
				if (adSlot.parentElement) {
					adSlot.parentElement.style.height = `${newHeight}px`;
				}
			}),
		)
		.then(() => {
			if (noSticky) {
				stickyElement = new Sticky(adSlot);
				stickyElement.init();
				register('resize', onResize);
			}
			mediator.emit('page:commercial:sticky-comments-mpu');
		});
};

stickyCommentsMpu.whenRendered = new Promise((resolve) => {
	mediator.on('page:commercial:sticky-comments-mpu', resolve);
});

const stickyMpu = (adSlot: HTMLElement): Promise<void> => {
	if (isStickyMpuSlot(adSlot)) {
		stickySlot = adSlot;
	}

	const referenceElement = document.querySelector<HTMLElement>(
		[
			'.js-article__body:not([style*="display: none;"])',
			'.js-liveblog-body-content:not([style*="display: none;"])',
		].join(', '),
	);

	// Fixes overlapping ad issue on liveblogs by Setting to max ad height.
	const stickyPixelBoundary = config.get('page.isLiveBlog') ? 600 : 300;

	if (
		!referenceElement ||
		window.guardian.config.page.hasShowcaseMainElement
	) {
		return Promise.resolve();
	}

	return fastdom
		.measure(() => referenceElement.offsetTop + stickyPixelBoundary)
		.then((newHeight) =>
			fastdom.mutate(() => {
				if (adSlot.parentElement) {
					adSlot.parentElement.style.height = `${newHeight}px`;
				}
			}),
		)
		.then(() => {
			if (noSticky) {
				// if there is a sticky 'paid by' band move the sticky mpu down so it will be always visible
				const options = config.get('page.isPaidContent')
					? {
							top: 43,
					  }
					: {};
				stickyElement = new Sticky(adSlot, options);
				stickyElement.init();
				register('resize', onResize);
			}
			mediator.emit('page:commercial:sticky-mpu');
		});
};

stickyMpu.whenRendered = new Promise((resolve) => {
	mediator.on('page:commercial:sticky-mpu', resolve);
});

export { stickyMpu, stickyCommentsMpu };
