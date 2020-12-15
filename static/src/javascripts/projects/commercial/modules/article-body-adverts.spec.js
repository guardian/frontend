import { init } from 'commercial/modules/article-body-adverts';
import config from 'lib/config';
import { spaceFiller } from 'common/modules/article/space-filler';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import {
    getViewport as getViewport_,
    getBreakpoint as getBreakpoint_,
    isBreakpoint as isBreakpoint_,
} from 'lib/detect';

const getViewport = getViewport_;
const getBreakpoint = getBreakpoint_;
const isBreakpoint = isBreakpoint_;

jest.mock('commercial/modules/dfp/track-ad-render', () => (id) => {
    const ads = {
        'dfp-ad--im': true,
    };
    return Promise.resolve(ads[id]);
});
jest.mock('commercial/modules/dfp/add-slot', () => ({
    addSlot: jest.fn(),
}));
jest.mock('common/modules/commercial/commercial-features', () => ({
    commercialFeatures: {},
}));
jest.mock('common/modules/article/space-filler', () => ({
    spaceFiller: {
        fillSpace: jest.fn(),
    },
}));
jest.mock('lib/detect', () => ({
    isBreakpoint: jest.fn(),
    getBreakpoint: jest.fn(),
    getViewport: jest.fn(),
}));
jest.mock('lib/config', () => ({ page: {}, get: () => false }));
jest.mock('common/modules/experiments/ab', () => ({
    isInVariantSynchronous: () => false,
}));

const spaceFillerStub = (spaceFiller.fillSpace);

describe('Article Body Adverts', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        commercialFeatures.articleBodyAdverts = true;
        spaceFillerStub.mockImplementation(() => Promise.resolve(2));
        getViewport.mockReturnValue({ height: 1300 });
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

    describe('When merchandising components enabled', () => {
        beforeEach(() => {
            getBreakpoint.mockReturnValue('mobile');
            isBreakpoint.mockReturnValue(true);
            config.page.hasInlineMerchandise = true;
        });
    });
});
