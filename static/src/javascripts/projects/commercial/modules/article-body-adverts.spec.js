// @flow
import {
    articleBodyAdvertsInit,
    _,
} from 'commercial/modules/article-body-adverts';
import config from 'lib/config';
import { spaceFiller } from 'common/modules/article/space-filler';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import detect from 'lib/detect';

jest.mock('commercial/modules/dfp/track-ad-render', () => (id: string) => {
    const ads = {
        'dfp-ad--im': true,
    };
    return Promise.resolve(ads[id]);
});
jest.mock('commercial/modules/dfp/add-slot', () => ({
    addSlot: jest.fn(),
}));
jest.mock('commercial/modules/commercial-features', () => ({
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
jest.mock('lib/config', () => ({ page: {} }));

const spaceFillerStub: JestMockFn = (spaceFiller.fillSpace: any);
const getFirstRulesUsed = () =>
    articleBodyAdvertsInit().then(() => {
        const firstCall = spaceFillerStub.mock.calls[0];
        return firstCall[0];
    });

describe('Article Body Adverts', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        commercialFeatures.articleBodyAdverts = true;
        spaceFillerStub.mockImplementation(() => Promise.resolve(true));
        detect.getViewport.mockReturnValue({ height: 1000 });
    });

    it('should exist', () => {
        expect(articleBodyAdvertsInit).toBeDefined();
    });

    it('should exit if commercial feature disabled', () => {
        commercialFeatures.articleBodyAdverts = false;
        return articleBodyAdvertsInit().then(executionResult => {
            expect(executionResult).toBe(false);
            expect(spaceFillerStub).not.toHaveBeenCalled();
        });
    });

    it('should call space-filler`s insertion method with the correct arguments', () =>
        articleBodyAdvertsInit().then(() => {
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
            detect.getBreakpoint.mockReturnValue('mobile');
            detect.isBreakpoint.mockReturnValue(true);
            config.page.hasInlineMerchandise = true;
        });

        it('its first call to space-filler uses the inline-merch rules', () =>
            articleBodyAdvertsInit().then(() => {
                const firstCallArgs = spaceFillerStub.mock.calls[0];
                const rules = firstCallArgs[0];

                expect(rules.minAbove).toEqual(300);
                expect(rules.selectors[' > h2'].minAbove).toEqual(100);
            }));

        it('its first call to space-filler passes an inline-merch writer', () => {
            const fixture = document.createElement('div');
            const paragraph = document.createElement('p');
            fixture.appendChild(paragraph);

            return articleBodyAdvertsInit().then(() => {
                const firstCall = spaceFillerStub.mock.calls[0];
                const writer = firstCall[1];
                writer([paragraph]);
                expect(fixture.querySelector('#dfp-ad--im')).toBeTruthy();
            });
        });

        it('inserts up to ten adverts when DFP returns empty merchandising components', () => {
            // The 0 is for addInlineMerchAd, failing to add a merchandising component.
            spaceFillerStub.mockReturnValueOnce(Promise.resolve(0));
            // The 2 is for addInlineAds, adding adverts using standard getRules().
            spaceFillerStub.mockReturnValueOnce(Promise.resolve(2));
            // The 8 is for addInlineAds again, adding adverts using getLongArticleRules().
            spaceFillerStub.mockReturnValueOnce(Promise.resolve(8));

            detect.getBreakpoint.mockReturnValue('tablet');

            jest.setMock(
                'commercial/modules/dfp/track-ad-render',
                (id: string) => {
                    const ads = {
                        'dfp-ad--im': false,
                    };
                    return Promise.resolve(ads[id]);
                }
            );

            return _.addInlineMerchAd()
                .then(_.waitForMerch)
                .then(_.addInlineAds)
                .then(countAdded => {
                    expect(countAdded).toEqual(10);
                });
        });
    });

    describe('Non-merchandising adverts', () => {
        beforeEach(() => {
            config.page.hasInlineMerchandise = false; // exclude IM components from count
        });

        describe('On mobiles and desktops', () => {
            it('inserts up to ten adverts', () => {
                spaceFillerStub.mockReturnValueOnce(Promise.resolve(2));
                spaceFillerStub.mockReturnValueOnce(Promise.resolve(8));
                return _.addInlineAds().then(countAdded => {
                    expect(countAdded).toEqual(10);
                });
            });

            it('inserts the third+ adverts with greater vertical spacing', () =>
                // We do not want the same ad-density on long-read
                // articles that we have on shorter pieces
                articleBodyAdvertsInit().then(() => {
                    const longArticleInsertCalls = spaceFillerStub.mock.calls.slice(
                        2
                    );
                    const longArticleInsertRules = longArticleInsertCalls.map(
                        call => call[0]
                    );
                    longArticleInsertRules.forEach(ruleset => {
                        const adSlotSpacing = ruleset.selectors[' .ad-slot'];
                        expect(adSlotSpacing).toEqual({
                            minAbove: 1300,
                            minBelow: 1300,
                        });
                    });
                }));
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
                detect.getBreakpoint.mockReturnValue('mobile');
                detect.isBreakpoint.mockReturnValue(true);

                return getFirstRulesUsed().then(rules => {
                    // adverts can appear higher up the page
                    expect(rules.minAbove).toEqual(300);

                    // give headings more vertical clearance
                    expect(rules.selectors[' > h2'].minAbove).toEqual(100);
                });
            });

            it('includes rules for tablet devices', () => {
                detect.getBreakpoint.mockReturnValue('tablet');
                // fudge check for max:tablet
                detect.isBreakpoint.mockReturnValue(true);

                return getFirstRulesUsed().then(rules => {
                    // adverts can appear higher up the page
                    expect(rules.minAbove).toEqual(300);

                    // give headings no vertical clearance
                    expect(rules.selectors[' > h2'].minAbove).toEqual(0);
                });
            });

            it('includes rules for larger screens', () => {
                detect.getBreakpoint.mockReturnValue('desktop');
                // fudge check for max:tablet
                detect.isBreakpoint.mockReturnValue(false);

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
