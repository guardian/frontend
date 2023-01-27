import { spaceFiller } from '../../common/modules/article/space-filler';
import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { init } from './article-body-adverts';

const ads = {
	'dfp-ad--im': true,
} as const;
jest.mock('./dfp/wait-for-advert', () => (id: keyof typeof ads) => {
	return Promise.resolve(ads[id]);
});
jest.mock('./dfp/add-slot', () => ({
	addSlot: jest.fn(),
}));
jest.mock('../../common/modules/commercial/commercial-features', () => ({
	commercialFeatures: {},
}));
jest.mock('../../common/modules/article/space-filler', () => ({
	spaceFiller: {
		fillSpace: jest.fn(),
	},
}));
jest.mock('../../../lib/config', () => ({ page: {}, get: () => false }));
jest.mock('../../common/modules/experiments/ab', () => ({
	isInVariantSynchronous: () => false,
}));

const spaceFillerStub = spaceFiller.fillSpace as jest.MockedFunction<
	typeof spaceFiller.fillSpace
>;

const mockViewport = (width: number, height: number): void => {
	Object.defineProperties(window, {
		innerWidth: {
			value: width,
		},
		innerHeight: {
			value: height,
		},
	});
};

describe('Article Body Adverts', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		commercialFeatures.articleBodyAdverts = true;
		// @ts-expect-error -- we need to TS space-filler’s queue
		spaceFillerStub.mockImplementation(() => Promise.resolve(2));
		mockViewport(0, 1300);
		expect.hasAssertions();
	});

	it('should exist', () => {
		expect(init).toBeDefined();
	});

	it('should exit if commercial feature disabled', () => {
		commercialFeatures.articleBodyAdverts = false;
		return init().then(() => {
			expect(spaceFillerStub).not.toHaveBeenCalled();
		});
	});
});
