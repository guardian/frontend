import { init, _ } from './liveblog-adverts';
import { spaceFiller } from '../../common/modules/article/space-filler';

const { getSlotName } = _;

jest.mock('../../../lib/raven');

jest.mock('../../../lib/mediator');

jest.mock('../../../lib/detect', () => ({
	getBreakpoint: jest.fn(),
	hasPushStateSupport: jest.fn(),
}));

jest.mock('../../common/modules/article/space-filler', () => ({
	spaceFiller: {
		fillSpace: jest.fn(() => Promise.resolve()),
	},
}));

jest.mock('../../common/modules/commercial/commercial-features', () => ({
	commercialFeatures: {
		liveblogAdverts: true,
	},
}));

jest.mock('./dfp/add-slot', () => ({
	addSlot: jest.fn(),
}));

const createFillSpaceMock = (paras) => (_, writerCallback) => {
	writerCallback(paras);
	return Promise.resolve(true);
};

describe('Liveblog Dynamic Adverts', () => {
	beforeEach(() => {
		if (document.body) {
			document.body.innerHTML = `
                <div class="js-liveblog-body">
                    <div class="block x1"></div>
                    <div class="block x2"></div>
                    <div class="block x3"></div>
                    <div class="block x4"></div>
                    <div class="block x5"></div>
                    <div class="block x6"></div>
                    <div class="block x7"></div>
                    <div class="block x8"></div>
                    <div class="block x9"></div>
                    <div class="block x10"></div>
                    <div class="block x11"></div>
                    <div class="block x12"></div>
                </div>';
                `;
		}
	});

	afterEach(() => {
		if (document.body) {
			document.body.innerHTML = '';
		}
	});

	it('should exist', () => {
		expect(init).toBeDefined();
	});

	it('should return the correct slot name', () => {
		const firstMobileSlot = getSlotName(true, 0);
		const otherMobileSlot = getSlotName(true, 2);
		const desktopSlot = getSlotName(false, 0);

		expect(firstMobileSlot).toBe('top-above-nav');
		expect(otherMobileSlot).toBe('inline2');
		expect(desktopSlot).toBe('inline1');
	});

	it('should insert ad slots', async () => {
		spaceFiller.fillSpace.mockImplementationOnce(
			createFillSpaceMock([
				document.querySelector('.x1'),
				document.querySelector('.x12'),
			]),
		);
		return init().then(() => {
			expect(document.querySelector('.x1').nextSibling.id).toEqual(
				'dfp-ad--inline1',
			);
			expect(document.querySelector('.x12').nextSibling.id).toEqual(
				'dfp-ad--inline2',
			);
			expect(
				document.querySelector('.js-liveblog-body').children.length,
			).toBe(14);
		});
	});

	// todo: difficult to mock spacefiller, which is not yet ES6'ed, so come back to this
	it.skip('should insert ads every 5th block', () =>
		init().then(() => {
			const adSlots = document.querySelectorAll(
				'.js-liveblog-body .ad-slot',
			);
			const candidates = document.querySelectorAll(
				'.js-liveblog-body > *:nth-child(5n+1)',
			);
			const candidatesAreAllAds = Array.prototype.every.call(
				candidates,
				(c) => c.classList.contains('ad-slot'),
			);
			expect(adSlots.length).toBeGreaterThan(0);
			expect(candidatesAreAllAds).toBe(true);
			expect(candidates.length).toEqual(adSlots.length);
		}));
});
