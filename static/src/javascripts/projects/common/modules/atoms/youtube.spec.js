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
        if (document.body) {
            document.body.innerHTML =
                '<div data-media-atom-id="atomId" class="u-responsive-ratio u-responsive-ratio--hd youtube-media-atom">' +
                '<div id="youtube-assetId"></div>' +
                '</div>';
        }
        checkElemsForVideos();
        if (document.body) {
            expect(document.body.innerHTML).toBe(
                '<div data-media-atom-id="atomId" class="u-responsive-ratio u-responsive-ratio--hd youtube-media-atom" data-unique-atom-id="atomId/0">' +
                    '<div id="youtube-assetId"></div>' +
                    '</div>'
            );
        }
    });
});
