// @flow
import config from 'lib/config';
import { adblockInUse as adblockInUse_ } from 'lib/detect';
import { plista } from 'commercial/modules/third-party-tags/plista';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { trackAdRender } from 'commercial/modules/dfp/track-ad-render';

const adblockInUse: any = adblockInUse_;

jest.mock('commercial/modules/dfp/track-ad-render', () => ({
    trackAdRender: jest.fn(),
}));

jest.mock('common/modules/commercial/commercial-features', () => ({
    commercialFeatures: {
        thirdPartyTags: true,
        plista: true,
    },
}));

jest.mock('lib/detect', () => {
    let adblockInUseMock = false;

    return {
        getBreakpoint: jest.fn(() => 'desktop'),
        adblockInUse: {
            then: fn => Promise.resolve(fn(adblockInUseMock)),
            mockReturnValue: value => {
                adblockInUseMock = value;
            },
        },
    };
});

jest.mock('common/modules/identity/api', () => ({
    isUserLoggedIn: jest.fn(() => true),
}));

const commercialFeaturesMock: any = commercialFeatures;
const trackAdRenderMock: any = trackAdRender;
let loadSpy: any;

trackAdRenderMock.mockReturnValue(Promise.resolve(true));

describe('Plista', () => {
    beforeEach(() => {
        config.switches.plistaForAu = true;
        config.page = {
            section: 'uk-news',
            isPreview: false,
            isFront: false,
            commentable: true,
            edition: 'AU',
        };

        if (document.body) {
            document.body.innerHTML = `
                <div class="js-plista"><div class="js-plista-container"></div></div>
            `;
        }
        loadSpy = jest.spyOn(plista, 'load');
        adblockInUse.mockReturnValue(false);
        expect.hasAssertions();
    });

    afterEach(() => {
        if (document.body) {
            document.body.innerHTML = '';
        }
        loadSpy.mockReset();
        jest.resetAllMocks();
    });

    describe('Init', () => {
        it('should exist', () => {
            expect(plista).toBeDefined();
        });

        it('should load plista component immediately when adblock in use', done => {
            if (document.body) {
                document.body.innerHTML +=
                    '<div id="dfp-ad--merchandising-high"></div>';
            }
            adblockInUse.mockReturnValue(true);
            plista.init().then(() => {
                expect(loadSpy).toHaveBeenCalled();
                done();
            });
        });

        it('should load plista component when render completes', done => {
            if (document.body) {
                document.body.innerHTML +=
                    '<div id="dfp-ad--merchandising-high"></div>';
            }
            trackAdRenderMock.mockReturnValueOnce(Promise.resolve(false));
            plista.init().then(() => {
                expect(loadSpy).toHaveBeenCalled();
                done();
            });
            expect(loadSpy).not.toHaveBeenCalled();
        });

        it('should not load plista component if already loaded', done => {
            if (document.body) {
                document.body.innerHTML +=
                    '<div id="dfp-ad--merchandising-high"></div>';
            }
            trackAdRenderMock.mockReturnValueOnce(Promise.resolve(true));
            plista.init().then(() => {
                expect(loadSpy).not.toHaveBeenCalled();
                done();
            });
        });

        it('should not load when sensitive content', done => {
            commercialFeaturesMock.plista = false;
            plista.init().then(resolvedPromise => {
                expect(resolvedPromise).toEqual(false);
                expect(loadSpy).not.toHaveBeenCalled();
                done();
            });
        });
    });
});
