import { _, checkElemsForVideos } from 'common/modules/atoms/youtube';
import { isAndroid as _isAndroid, isIOS as _isIOS } from 'lib/detect';
import { isOn as _isOn } from 'common/modules/accessibility/main';
import config from 'lib/config';

const { getIFrameBehaviour, getIFrameBehaviourConfig } = _;

const isAndroid = _isAndroid;
const isIOS = _isIOS;
const accessibilityIsOn = _isOn;

jest.mock('lib/detect', () => {
    
    const original = jest.requireActual('lib/detect');
    return {
        ...original,
        isAndroid: jest.fn(),
        isIOS: jest.fn(),
    };
});

jest.mock('common/modules/accessibility/main', () => {
    
    const original = jest.requireActual('common/modules/accessibility/main');
    return {
        ...original,
        isOn: jest.fn(),
    };
});

jest.mock('common/modules/atoms/youtube-player', () => ({
    initYoutubePlayer: jest.fn(() => null),
}));

jest.mock('common/modules/atoms/youtube-tracking', () => ({
    initYoutubeEvents: jest.fn(() => null),
    trackYoutubeEvents: jest.fn(() => null),
}));

jest.mock('lib/report-error', () => jest.fn());

describe('youtube', () => {
    it('assigns an atom a unique ID', () => {
        const atomId = 'atomA';
        const assetId = 'assetC';
        if (document.body) {
            document.body.innerHTML = `<div data-media-atom-id="${atomId}" class="u-responsive-ratio u-responsive-ratio--hd youtube-media-atom"><div id="youtube-${assetId}" class="youtube-media-atom__iframe"></div></div>`;
        }

        checkElemsForVideos();

        if (document.body) {
            const atom = document.querySelector('.youtube-media-atom');

            expect(atom).toBeDefined();

            if (atom) {
                expect(atom.getAttribute('data-unique-atom-id')).toBeDefined();
            }
        }
    });

    it('does not try to replace link to a video page with a player', () => {
        const atomId = 'atomA';

        const div = `<div data-media-atom-id="${atomId}" class="no-player u-responsive-ratio youtube-media-atom"><div class="vjs-big-play-button youtube-media-atom__overlay"><div class="youtube-media-atom__play-button vjs-control-text">Play Video</div></div></div>`;

        if (document.body) {
            document.body.innerHTML = div;
        }

        checkElemsForVideos();

        if (document.body) {
            expect(document.body.innerHTML).toBe(div);
        }
    });

    describe(`determining correct youtube iframe behaviour`, () => {
        it('autoplays muted US paid content videos on Android', () => {
            isAndroid.mockReturnValue(true);
            const iFrameBehaviourConfig = {
                isAutoplayBlockingPlatform: true,
                isInternalReferrer: true,
                isMainVideo: true,
                flashingElementsAllowed: true,
                isVideoArticle: true,
                isFront: false,
                isUSContent: true,
                isPaidContent: true,
            };
            expect(getIFrameBehaviour(iFrameBehaviourConfig)).toEqual({
                autoplay: true,
                mutedOnStart: true,
            });
        });

        it("doesn't mute US paid content videos on desktop", () => {
            isAndroid.mockReturnValue(false);
            const iFrameBehaviourConfig = {
                isAutoplayBlockingPlatform: false,
                isInternalReferrer: true,
                isMainVideo: true,
                flashingElementsAllowed: true,
                isVideoArticle: true,
                isFront: false,
                isUSContent: true,
                isPaidContent: true,
            };
            expect(getIFrameBehaviour(iFrameBehaviourConfig)).toEqual({
                autoplay: true,
                mutedOnStart: false,
            });
        });

        it("doesn't mute autoplaying videos on desktop fronts", () => {
            isAndroid.mockReturnValue(false);
            const iFrameBehaviourConfig = {
                isAutoplayBlockingPlatform: false,
                isInternalReferrer: false,
                isMainVideo: false,
                flashingElementsAllowed: true,
                isVideoArticle: false,
                isFront: true,
                isUSContent: false,
                isPaidContent: false,
            };
            expect(getIFrameBehaviour(iFrameBehaviourConfig)).toEqual({
                autoplay: true,
                mutedOnStart: false,
            });
        });

        it("doesn't autoplay videos when flashing elements are disallowed", () => {
            isAndroid.mockReturnValue(false);
            const iFrameBehaviourConfig = {
                isAutoplayBlockingPlatform: false,
                isInternalReferrer: false,
                isMainVideo: false,
                flashingElementsAllowed: false,
                isVideoArticle: false,
                isFront: true,
                isUSContent: false,
                isPaidContent: false,
            };
            expect(getIFrameBehaviour(iFrameBehaviourConfig)).toEqual({
                autoplay: false,
                mutedOnStart: false,
            });
        });
    });

    describe(`getting correct iframe behaviour config`, () => {
        let docSrc;
        let div;
        let iframe;

        beforeEach(() => {
            /* eslint-disable guardian-frontend/global-config */
            Object.assign(window.guardian.config, {
                page: {
                    isDev: false,
                    host: 'https://www.theguardian.com',
                    isFront: true,
                    isPaidContent: true,
                },
            });

            docSrc = 'http://www.example.com/q';
            div = `<div id="outerDiv"><iframe id="iframeId" src="${docSrc}"></iframe></div>`;
            if (document.body) {
                document.body.innerHTML = div;
            }
            iframe = ((document.getElementById(
                'iframeId'
            )));
        });

        it('is Autoplay blocking platform if isAndroid', () => {
            isAndroid.mockReturnValue(true);
            isIOS.mockReturnValue(false);
            const iFrameBehaviourConfig = getIFrameBehaviourConfig(iframe);
            expect(iFrameBehaviourConfig.isAutoplayBlockingPlatform).toBe(true);
        });

        it('is Autoplay blocking platform if isIOS', () => {
            isAndroid.mockReturnValue(false);
            isIOS.mockReturnValue(true);
            const iFrameBehaviourConfig = getIFrameBehaviourConfig(iframe);
            expect(iFrameBehaviourConfig.isAutoplayBlockingPlatform).toBe(true);
        });

        it('correctly identifies Internal Referrer', () => {
            
            jest.spyOn(global.document, 'referrer', 'get').mockReturnValueOnce(
                'https://www.theguardian.com'
            );
            expect(getIFrameBehaviourConfig(iframe).isInternalReferrer).toBe(
                true
            );
            
            jest.spyOn(global.document, 'referrer', 'get').mockReturnValueOnce(
                'https://www.garbage-site.com'
            );
            expect(getIFrameBehaviourConfig(iframe).isInternalReferrer).toBe(
                false
            );
        });

        it('correctly identifies it isMainVideo', () => {
            // Return true once to mock "'figure[data-component="main video"]'" bring present
            jest.spyOn(iframe, 'closest').mockReturnValueOnce(true);
            expect(getIFrameBehaviourConfig(iframe).isMainVideo).toBe(true);
            // Expect false as we no longer have specified node in the mock.
            expect(getIFrameBehaviourConfig(iframe).isMainVideo).toBe(false);
        });

        it('correctly configures for flashing element preferences', () => {
            accessibilityIsOn.mockReturnValueOnce(true);
            expect(
                getIFrameBehaviourConfig(iframe).flashingElementsAllowed
            ).toBe(true);
            accessibilityIsOn.mockReturnValueOnce(false);
            expect(
                getIFrameBehaviourConfig(iframe).flashingElementsAllowed
            ).toBe(false);
        });

        it('correctly identify isFront', () => {
            expect(getIFrameBehaviourConfig(iframe).isFront).toBe(true);
            config.set('page.isFront', false);
            expect(getIFrameBehaviourConfig(iframe).isVideoArticle).toBe(false);
        });

        it('correctly identify isVideoArticle', () => {
            expect(getIFrameBehaviourConfig(iframe).isVideoArticle).toBe(false);
            config.set('page.contentType', 'video');
            expect(getIFrameBehaviourConfig(iframe).isVideoArticle).toBe(true);
        });

        it('correctly identify isUSContent', () => {
            expect(getIFrameBehaviourConfig(iframe).isUSContent).toBe(false);
            config.set('page.productionOffice', 'us');
            expect(getIFrameBehaviourConfig(iframe).isUSContent).toBe(true);
        });

        it('correctly identify isPaidContent', () => {
            expect(getIFrameBehaviourConfig(iframe).isPaidContent).toBe(true);
            config.set('page.isPaidContent', false);
            expect(getIFrameBehaviourConfig(iframe).isPaidContent).toBe(false);
        });
    });
});
