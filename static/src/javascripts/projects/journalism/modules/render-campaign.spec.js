// @flow

import { initCampaign } from 'journalism/modules/render-campaign';

jest.mock('journalism/modules/get-campaign');

describe('Create a campaign element and insert into an article', () => {
    beforeEach(() => {
        if (document.body) {
            document.body.innerHTML =
                '<div class="content__article-body"><h1>title</h1><p>one</p><p>two</p><p>three</p><p>four</p></div>';
        }
    });

    afterEach(() => {
        if (document.body) {
            document.body.innerHTML = '';
        }
    });

    it('adds the campaign element to the article body', () => {
        initCampaign();
        expect(document.querySelectorAll('figure').length).toBe(1);
    });
});
