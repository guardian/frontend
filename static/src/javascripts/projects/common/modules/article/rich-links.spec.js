import config from 'lib/config';
import {
    richLinkTag,
} from 'common/modules/article/rich-links';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';

let mockParas;

jest.mock('lib/raven');
jest.mock('lib/config');
jest.mock('common/modules/article/space-filler', () => ({
    spaceFiller: {
        fillSpace: (
            rules,
            writer
        ) =>
            new Promise(resolve => {
                writer(mockParas);
                resolve(true);
            }),
    },
}));
jest.mock('common/modules/commercial/commercial-features', () => ({
    commercialFeatures() {},
}));

describe('rich-links', () => {
    const getRichLinkElements = () =>
        document.getElementsByClassName('element-rich-link');

    beforeEach(() => {
        if (document.body) {
            document.body.innerHTML =
                '<div class="js-article__body"><p>foo</p></div>';
            mockParas = document.querySelectorAll('p');
        }

        config.page = {
            richLink: 'foo',
            pageId: 'bar',
            showRelatedContent: true,
            shouldHideAdverts: false,
        };

        commercialFeatures.adFree = false;
    });

    afterEach(() => {
        if (document.body) {
            document.body.innerHTML = '';
        }
        mockParas = null;
        delete config.page;
    });
});
