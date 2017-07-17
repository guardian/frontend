// @flow
import config from 'lib/config';
import detect from 'lib/detect';
import plista from 'commercial/modules/third-party-tags/plista';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import trackAdRender from 'commercial/modules/dfp/track-ad-render';

jest.mock('commercial/modules/dfp/track-ad-render', () => jest.fn());

jest.mock('commercial/modules/commercial-features', () => ({
    commercialFeatures: {
        thirdPartyTags: true,
        outbrain: true,
    },
}));

jest.mock('lib/detect', () => {
    let adblockInUse = false;
    return {
        getBreakpoint: jest.fn(() => 'desktop'),
        adblockInUse: {
            then: fn => Promise.resolve(fn(adblockInUse)),
            mockReturnValue: value => {
                adblockInUse = value;
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
        config.switches.plistaForOutbrainAu = true;
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
        detect.adblockInUse.mockReturnValue(false);
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
            detect.adblockInUse.mockReturnValue(true);
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
            commercialFeaturesMock.outbrain = false;
            plista.init().then(resolvedPromise => {
                expect(resolvedPromise).toEqual(false);
                expect(loadSpy).not.toHaveBeenCalled();
                done();
            });
        });
    });
});
