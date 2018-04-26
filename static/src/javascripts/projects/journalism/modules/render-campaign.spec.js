// @flow

import { initCampaign } from 'journalism/modules/render-campaign';
import { getCampaign } from 'journalism/modules/get-campaign';

// hack to stop flow complaining about 'mockImplementation'
const mock = (mockFn: any) => mockFn;
jest.mock('journalism/modules/get-campaign');
mock(getCampaign).mockImplementation(() => ({ title: 'A great campaign' }));

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
