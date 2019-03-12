// @flow
import { load } from 'commercial/modules/hosted/next-video';
import fetchJson from 'lib/fetch-json';
import config from 'lib/config';

jest.mock('lib/fetch-json', () =>
    jest.fn(() => Promise.resolve({ html: '<div class="video"></div>' }))
);

describe('Hosted Next Video', () => {
    beforeAll(() => {
        config.set('page', {
            ajaxUrl: 'some.url',
            pageId: 'pageId',
        });
    });
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
        expect(load).toBeDefined();
    });

    it('should make an ajax call and insert html', done => {
        load()
            .then(() => {
                expect(fetchJson).toHaveBeenCalledWith(
                    'some.url/pageId/autoplay.json',
                    {
                        mode: 'cors',
                    }
                );
                expect(
                    document.querySelector('.js-autoplay-placeholder .video')
                ).not.toBeNull();
            })
            .then(done)
            .catch(done.fail);
    });
});
