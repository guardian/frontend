// @flow

import config from 'lib/config';
import {
    richLinkTag,
    insertTagRichLink,
} from 'common/modules/article/rich-links';

let mockParas: ?NodeList<HTMLParagraphElement>;

jest.mock('lib/config');
jest.mock('lib/detect');
jest.mock('lib/fetch-json');
jest.mock('lib/mediator');
jest.mock('lib/report-error');
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
            test('given config.page.richLink is undefined', () => {
                delete config.page.richLink;

                return insertTagRichLink().then(() => {
                    const richLinkElements = getRichLinkElements();

                    expect(richLinkElements.length).toBe(0);
                });
            });

            test('given config.page.richLink includes config.page.pageId', () => {
                config.page.pageId = 'foo';

                return insertTagRichLink().then(() => {
                    const richLinkElements = getRichLinkElements();

                    expect(richLinkElements.length).toBe(0);
                });
            });

            test('given config.shouldHideAdverts is true', () => {
                config.page.shouldHideAdverts = true;

                return insertTagRichLink().then(() => {
                    const richLinkElements = getRichLinkElements();

                    expect(richLinkElements.length).toBe(0);
                });
            });

            test('given config.showRelatedContent is false', () => {
                config.page.showRelatedContent = false;

                return insertTagRichLink().then(() => {
                    const richLinkElements = getRichLinkElements();

                    expect(richLinkElements.length).toBe(0);
                });
            });
        });

        test('should insert a tag rich link', () =>
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
