// @flow
import { checkElemsForVideos } from 'common/modules/atoms/youtube';

jest.mock('common/modules/atoms/youtube-player', () => ({
    initYoutubePlayer: jest.fn(() => null),
}));

jest.mock('common/modules/atoms/youtube-tracking', () => ({
    initYoutubeEvents: jest.fn(() => null),
    trackYoutubeEvents: jest.fn(() => null),
}));

describe('youtube', () => {
    it('adds player to page', () => {
        const atomId = 'atomA';
        const assetId = 'assetC';
        if (document.body) {
            document.body.innerHTML = `<div data-media-atom-id="${atomId}" class="u-responsive-ratio u-responsive-ratio--hd youtube-media-atom"><div id="youtube-${assetId}"></div></div>`;
        }

        checkElemsForVideos();

        if (document.body) {
            expect(document.body.innerHTML).toBe(
                `<div data-media-atom-id="${atomId}" class="u-responsive-ratio u-responsive-ratio--hd youtube-media-atom" data-unique-atom-id="${atomId}/0"><div id="youtube-${assetId}"></div></div>`
            );
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
});
