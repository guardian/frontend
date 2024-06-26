import { initCampaign } from 'journalism/modules/render-campaign';
import { getCampaigns } from 'journalism/modules/get-campaign';

// hack to stop flow complaining about 'mockImplementation'
const mock = (mockFn) => mockFn;
jest.mock('journalism/modules/get-campaign');
mock(getCampaigns).mockImplementation(() => ({
    'callout-hij': {
        description: '<p>formatted <b>description</b></p>',
        formFields: [],
        formId: 2994970,
        name: 'callout hij',
        title: 'Callout HIJ',
        tagName: 'callout-hij',
    },
    'callout-klm': {
        description: '<p>new test<b>&nbsp;</b></p>',
        formFields: [],
        formId: 2994970,
        name: 'callout klm',
        title: 'Callout klm',
        tagName: 'callout-klm',
    },
}));

const articleBodyWithCalloutBoxes =
    '<div class="content__article-body"><h1>title</h1><p>one</p><p>two</p><figure data-alt="Callout callout-hij"></figure><p>three</p><p>four</p><figure data-alt="Callout callout-klm"></figure></div>';
const articleBody =
    '<div className="content__article-body"><h1>title</h1><p>one</p><p>two</p><p>three</p><p>four</p></div>';
const renderedCallout =
    '<figure class="element element-campaign"><div></div></figure>';

const setUpArticle = articleType => {
    if (document.body) {
        document.body.innerHTML = articleType;
    }
};

const clearUpArticle = () => {
    if (document.body) {
        document.body.innerHTML = '';
    }
};

describe('If a callout container and callout data are both present', () => {
    beforeEach(() => setUpArticle(articleBodyWithCalloutBoxes));
    afterEach(() => clearUpArticle());

    // unfortunately the lodash template used in rendering can't be easily mocked so this basic comparision is all I can do
    it('puts the callout in the right container', () => {
        initCampaign();
        expect(document.querySelectorAll('figure')[0].innerHTML).toEqual(
            renderedCallout
        );
    });
});

describe('If there are no container boxes, no callout is added', () => {
    beforeEach(() => setUpArticle(articleBody));
    afterEach(() => clearUpArticle());

    it('doesnt render a callout, even if the data is present', () => {
        initCampaign();
        expect(document.querySelectorAll('figure').length).toBe(0);
    });
});

describe('If there is no data, no callout is added', () => {
    beforeEach(() => {
        setUpArticle(articleBodyWithCalloutBoxes);
        mock(getCampaigns).mockImplementation(() => []);
    });
    afterEach(() => clearUpArticle());

    it('doesnt render a callout, even if the container is present', () => {
        initCampaign();
        expect(document.querySelectorAll('figure')[0].innerHTML).toBe('');
    });
});
