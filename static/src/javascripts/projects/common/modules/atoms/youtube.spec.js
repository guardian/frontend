// @flow
import { checkElemsForVideos, muteIFrame } from 'common/modules/atoms/youtube';

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

    it('mutes an iframe by amending the src property if no other URL paramaters', () => {
        const docSrc = 'http://www.testme.com';

        const div = `<div id="outerDiv"><iframe id="iframeId" src="${docSrc}"></iframe></div>`;

        if (document.body) {
            document.body.innerHTML = div;
        }

        const iframe = ((document.getElementById(
            'iframeId'
        ): any): HTMLIFrameElement);

        muteIFrame(iframe);

        if (document.body) {
            expect(iframe.src).toBe('http://www.test.me.com?mute=1');
        }
    });

    it('adds a new parameter to mute iframe if parameters already exist', () => {
        const docSrc = 'http://www.testme.com?randomParam=abc';

        const div = `<div id="outerDiv"><iframe id="iframeId" src="${docSrc}"></iframe></div>`;

        if (document.body) {
            document.body.innerHTML = div;
        }

        const iframe = ((document.getElementById(
            'iframeId'
        ): any): HTMLIFrameElement);

        muteIFrame(iframe);

        if (document.body) {
            expect(iframe.src).toBe(
                'http://www.testme.com?randomParam=abc&mute=1'
            );
        }
    });

    it("doesn't amend iframe src property if already muted", () => {
        const docSrc = 'http://www.testme.com?mute=1';

        const div = `<div id="outerDiv"><iframe id="iframeId" src="${docSrc}"></iframe></div>`;

        if (document.body) {
            document.body.innerHTML = div;
        }

        const iframe = ((document.getElementById(
            'iframeId'
        ): any): HTMLIFrameElement);

        muteIFrame(iframe);

        if (document.body) {
            expect(iframe.src).toBe('http://www.test.me.com?mute=1');
        }
    });
});
