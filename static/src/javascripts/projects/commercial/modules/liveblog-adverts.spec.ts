import type {
	SpacefinderRules,
	SpacefinderWriter,
} from '../../common/modules/article/space-filler';
import { spaceFiller } from '../../common/modules/article/space-filler';
import { _, init } from './liveblog-adverts';

const { getSlotName } = _;

jest.mock('ophan/ng', () => null);

jest.mock('../../../lib/raven');

jest.mock('../../../lib/mediator');

jest.mock('../../../lib/detect');

jest.mock('../../common/modules/article/space-filler', () => ({
	spaceFiller: {
		fillSpace: jest.fn(() => Promise.resolve(true)),
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

const spaceFillerStub = spaceFiller.fillSpace as jest.MockedFunction<
	typeof spaceFiller.fillSpace
>;

const createFillSpaceMock =
	(paras: HTMLElement[]) =>
	(_: SpacefinderRules, writerCallback: SpacefinderWriter) => {
		void writerCallback(paras);
		return Promise.resolve(true);
	};

describe('Liveblog Dynamic Adverts', () => {
	beforeEach(() => {
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
	});

	afterEach(() => {
		document.body.innerHTML = '';
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
		const block1 = document.querySelector<HTMLElement>('.x1');
		const block2 = document.querySelector<HTMLElement>('.x12');
		if (block1 === null || block2 === null) {
			throw Error();
		}
		spaceFillerStub.mockImplementationOnce(
			createFillSpaceMock([block1, block2]),
		);
		return init().then(() => {
			expect(
				document.querySelector('.x1')?.nextElementSibling?.id,
			).toEqual('dfp-ad--inline1');
			expect(
				document.querySelector('.x12')?.nextElementSibling?.id,
			).toEqual('dfp-ad--inline2');
			expect(
				document.querySelector('.js-liveblog-body')?.children.length,
			).toBe(14);
		});
	});
});
