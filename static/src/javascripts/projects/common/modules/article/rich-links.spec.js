// @flow

import config from 'lib/config';
import {
    richLinkTag,
    insertTagRichLink,
} from 'common/modules/article/rich-links';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';

let mockParas: ?NodeList<HTMLParagraphElement>;

jest.mock('lib/raven');
jest.mock('lib/config');
jest.mock('common/modules/article/space-filler', () => ({
    spaceFiller: {
        fillSpace: (
            rules: Object,
            writer: (?NodeList<HTMLParagraphElement>) => any
        ): Promise<any> =>
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
    const getRichLinkElements = (): HTMLCollection<HTMLElement> =>
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

    describe('insertTagRichLink', () => {
        describe('should not insert a tag rich link', () => {
            it('given config.page.richLink is undefined', () => {
                delete config.page.richLink;

                return insertTagRichLink().then(() => {
                    const richLinkElements = getRichLinkElements();

                    expect(richLinkElements.length).toBe(0);
                });
            });

            it('given config.page.richLink includes config.page.pageId', () => {
                config.page.pageId = 'foo';

                return insertTagRichLink().then(() => {
                    const richLinkElements = getRichLinkElements();

                    expect(richLinkElements.length).toBe(0);
                });
            });

            it('given config.shouldHideAdverts is true', () => {
                config.page.shouldHideAdverts = true;

                return insertTagRichLink().then(() => {
                    const richLinkElements = getRichLinkElements();

                    expect(richLinkElements.length).toBe(0);
                });
            });

            it('given config.showRelatedContent is false', () => {
                config.page.showRelatedContent = false;

                return insertTagRichLink().then(() => {
                    const richLinkElements = getRichLinkElements();

                    expect(richLinkElements.length).toBe(0);
                });
            });
        });

        it('should insert a tag rich link', () =>
            insertTagRichLink().then(() => {
                const richLinkElements = getRichLinkElements();

                expect(richLinkElements.length).toBe(1);
                expect(richLinkElements[0].outerHTML.replace(/\s/g, '')).toBe(
                    richLinkTag({ href: config.page.richLink }).replace(
                        /\s/g,
                        ''
                    )
                );
            }));
    });
});
