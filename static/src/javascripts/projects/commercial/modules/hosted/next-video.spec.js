// @flow
import hostedNextVideo from 'commercial/modules/hosted/next-video';
import fetchJson from 'lib/fetch-json';

jest.mock('lib/config', () => ({
    page: {
        ajaxUrl: 'some.url',
        pageId: 'pageId',
    },
}));

jest.mock('lib/fetch-json', () =>
    jest.fn(() => Promise.resolve({ html: '<div class="video"></div>' }))
);

describe('Hosted Next Video', () => {
    beforeEach(() => {
        if (document.body) {
            document.body.innerHTML =
                '<div class="js-autoplay-placeholder"></div>';
        }
    });

    afterEach(() => {
        if (document.body) {
            document.body.innerHTML = '';
        }
    });

    it('should exist', () => {
        expect(hostedNextVideo).toBeDefined();
    });

    it('should make an ajax call and insert html', done => {
        hostedNextVideo
            .load()
            .then(() => {
                expect(
                    fetchJson
                ).toHaveBeenCalledWith('some.url/pageId/autoplay.json', {
                    mode: 'cors',
                });
                expect(
                    document.querySelector('.js-autoplay-placeholder .video')
                ).not.toBeNull();
            })
            .then(done)
            .catch(done.fail);
    });
});
