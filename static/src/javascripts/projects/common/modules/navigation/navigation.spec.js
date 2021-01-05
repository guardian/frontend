import {
    initNavigation,
} from 'common/modules/navigation/navigation';

jest.mock('lib/fastdom-promise');

jest.mock('lib/detect', () => ({
    isIOS: jest.fn(() => false),
}));

describe('Navigation', () => {
    const PLACEHOLDER_CLASS = 'js-mega-nav-placeholder';
    const NAVIGATION_CONTAINER_CLASS = 'navigation-container--default';
    const LINK_CLASS = 'js-navigation-toggle';

    const domSnippet = `<div class="js-navigation-header navigation-container--collapsed">
        <a class="${LINK_CLASS}" href="#footer-nav" data-target-nav="js-navigation-header"></a>
        <div class="${PLACEHOLDER_CLASS}"></div>
    </div>
    <div class="js-mega-nav">
        <div class="global-navigation">Nav</div>
    </div>
    <div class="${NAVIGATION_CONTAINER_CLASS}"></div>`;

    beforeEach(() => {
        if (document.body) {
            document.body.innerHTML = domSnippet;
        }
    });

    afterEach(() => {
        if (document.body) {
            document.body.innerHTML = '';
        }
    });

    it('collapse default navigation', () => {
        const navigationContainer = document.getElementsByClassName(
            NAVIGATION_CONTAINER_CLASS
        )[0];

        return initNavigation().then(() => {
            if (navigationContainer) {
                expect(
                    navigationContainer.classList.contains(
                        NAVIGATION_CONTAINER_CLASS
                    )
                ).toBeFalsy();
                expect(
                    navigationContainer.classList.contains(
                        'navigation-container--collapsed'
                    )
                ).toBeTruthy();
            }
        });
    });

    it('should copy mega nav menu to placeholder', () => {
        const placeholder = document.getElementsByClassName(
            PLACEHOLDER_CLASS
        )[0];

        return initNavigation().then(() => {
            if (placeholder) {
                expect(placeholder.innerHTML).toEqual(
                    '<div class="global-navigation">Nav</div>'
                );
            }
        });
    });

    it('should change all sections link', () => {
        const sectionLink = document.getElementsByClassName(LINK_CLASS)[0];

        if (sectionLink) {
            expect(sectionLink.getAttribute('href')).toEqual('#footer-nav');
        }

        return initNavigation().then(() => {
            if (sectionLink) {
                expect(sectionLink.getAttribute('href')).toEqual(
                    '#nav-allsections'
                );
            }
        });
    });
});
