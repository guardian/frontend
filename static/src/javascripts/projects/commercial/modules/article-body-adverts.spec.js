// @flow
import { init } from 'commercial/modules/article-body-adverts';
import config from 'lib/config';
import { spaceFiller } from 'common/modules/article/space-filler';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import {
    getViewport as getViewport_,
    getBreakpoint as getBreakpoint_,
    isBreakpoint as isBreakpoint_,
} from 'lib/detect';
import { noop } from 'lib/noop';

const getViewport: any = getViewport_;
const getBreakpoint: any = getBreakpoint_;
const isBreakpoint: any = isBreakpoint_;

jest.mock('commercial/modules/dfp/track-ad-render', () => (id: string) => {
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

const spaceFillerStub: JestMockFn<*, *> = (spaceFiller.fillSpace: any);
const getFirstRulesUsed = () =>
    init(noop, noop).then(() => {
        const firstCall = spaceFillerStub.mock.calls[0];
        return firstCall[0];
    });

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
        return init(noop, noop).then(executionResult => {
            expect(executionResult).toBe(false);
            expect(spaceFillerStub).not.toHaveBeenCalled();
        });
    });

    it('should call space-filler`s insertion method with the correct arguments', () =>
        init(noop, noop).then(() => {
            expect(spaceFillerStub).toHaveBeenCalled();
            const firstCallArgs = spaceFillerStub.mock.calls[0];
            const rulesArg = firstCallArgs[0];
            const writerArg = firstCallArgs[1];

            expect(rulesArg.minAbove).toBeDefined();
            expect(rulesArg.minBelow).toBeDefined();
            expect(rulesArg.selectors).toBeDefined();

            expect(writerArg).toEqual(expect.any(Function));
        }));

    describe('When merchandising components enabled', () => {
        beforeEach(() => {
            getBreakpoint.mockReturnValue('mobile');
            isBreakpoint.mockReturnValue(true);
            config.page.hasInlineMerchandise = true;
        });

        it('its first call to space-filler uses the inline-merch rules', () =>
            init(noop, noop).then(() => {
                const firstCallArgs = spaceFillerStub.mock.calls[0];
                const rules = firstCallArgs[0];

                expect(rules.minAbove).toEqual(300);
                expect(rules.selectors[' > h2'].minAbove).toEqual(100);
            }));

        it('its first call to space-filler passes an inline-merch writer', () => {
            const fixture = document.createElement('div');
            const paragraph = document.createElement('p');
            fixture.appendChild(paragraph);

            return init(noop, noop).then(() => {
                const firstCall = spaceFillerStub.mock.calls[0];
                const writer = firstCall[1];
                writer([paragraph]);
                expect(fixture.querySelector('#dfp-ad--im')).toBeTruthy();
            });
        });
    });

    describe('Non-merchandising adverts', () => {
        beforeEach(() => {
            config.page.hasInlineMerchandise = false; // exclude IM components from count
        });

        describe('Spacefinder rules', () => {
            it('includes basic rules for all circumstances', () =>
                getFirstRulesUsed().then(rules => {
                    // do not appear in the bottom 300px of the article
                    expect(rules.minBelow).toBe(300);

                    // do not appear above headings
                    expect(rules.selectors[' > h2'].minBelow).toEqual(250);

                    // do not appear next to other adverts
                    expect(rules.selectors[' .ad-slot']).toEqual({
                        minAbove: 500,
                        minBelow: 500,
                    });

                    // do not appear next to non-paragraph elements
                    expect(
                        rules.selectors[' > :not(p):not(h2):not(.ad-slot)']
                    ).toEqual({
                        minAbove: 35,
                        minBelow: 400,
                    });
                }));

            it('includes rules for mobile phones', () => {
                getBreakpoint.mockReturnValue('mobile');
                isBreakpoint.mockReturnValue(true);

                return getFirstRulesUsed().then(rules => {
                    // adverts can appear higher up the page
                    expect(rules.minAbove).toEqual(300);

                    // give headings more vertical clearance
                    expect(rules.selectors[' > h2'].minAbove).toEqual(100);
                });
            });

            it('includes rules for tablet devices', () => {
                getBreakpoint.mockReturnValue('tablet');
                // fudge check for max:tablet
                isBreakpoint.mockReturnValue(true);

                return getFirstRulesUsed().then(rules => {
                    // adverts can appear higher up the page
                    expect(rules.minAbove).toEqual(300);

                    // give headings no vertical clearance
                    expect(rules.selectors[' > h2'].minAbove).toEqual(0);
                });
            });

            it('includes rules for larger screens', () => {
                getBreakpoint.mockReturnValue('desktop');
                // fudge check for max:tablet
                isBreakpoint.mockReturnValue(false);

                return getFirstRulesUsed().then(rules => {
                    // adverts give the top of the page more clearance
                    expect(rules.minAbove).toEqual(700);

                    // give headings no vertical clearance
                    expect(rules.selectors[' > h2'].minAbove).toEqual(0);
                });
            });
        });
    });
});
