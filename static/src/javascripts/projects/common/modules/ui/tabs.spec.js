// @flow

import { init as tabsInit, _ } from './tabs';

const NAV_CLASSES = [
    'tabs__tab--selected',
    'tone-colour',
    'tone-accent-border',
];

jest.mock('lib/fastdom-promise');

// Not yet implemented, see https://github.com/tmpvar/jsdom/issues/961
HTMLElement.prototype.dataset = {};

const markup = `
    <p id="tabs-test">
        <div class="tabs">
            <ol class="tabs__container js-tabs"
                role="tablist">
                <li class="tabs__tab tabs__tab--selected"
                    id="tab-1-tab" role="tab"
                    aria-selected="true"
                    aria-controls="tab1panel">
                    <a id="tab1"
                       href="#tab1panel">Foo</a>
                </li>

                <li class="tabs__tab"
                    id="tab-2-tab"
                    role="tab"
                    aria-selected="false"
                    aria-controls="tab2panel">
                    <a id="tab2"
                       href="#tab2panel">Bar</a>
                </li>
            </ol>

            <div class="tabs__content">
                <div class="tabs__pane"
                     id="tab1panel"
                     role="tabpanel">foo</div>
                <div class="tabs__pane modern-hidden"
                     id="tab2panel"
                     role="tabpanel">bar</div>
            </div>
        </div>
    </p>
`;

beforeEach(() => {
    if (document.body) {
        document.body.innerHTML = markup;
    }
});

afterEach(() => {
    if (document.body) {
        document.body.innerHTML = '';
    }
});

test('should properly save the initialized state', () => {
    const nav: HTMLElement = (document.querySelector('.js-tabs'): any);

    expect(nav.getAttribute('data-tabs-initialized')).toBe(null);

    return tabsInit().then(() => {
        expect(nav.getAttribute('data-tabs-initialized')).toBe('true');
    });
});

test('showPane()', () => {
    const tab: HTMLElement = (document.getElementById('tab2'): any);
    const tabList: HTMLElement = (tab.parentNode: any);
    const pane: HTMLElement = (document.getElementById('tab2panel'): any);

    return _.showPane(tab, pane).then(() => {
        expect(pane.classList.contains('u-h')).toBe(false);
        expect(pane.classList.contains('modern-hidden')).toBe(false);
        expect(tabList.getAttribute('aria-selected')).toBe('true');

        NAV_CLASSES.forEach(className => {
            expect(tabList.classList.contains(className)).toBe(true);
        });
    });
});

test('hidePane()', () => {
    const tab: HTMLElement = (document.getElementById('tab2'): any);
    const tabList: HTMLElement = (tab.parentNode: any);
    const pane: HTMLElement = (document.getElementById('tab2panel'): any);

    return _.showPane(tab, pane).then(() =>
        _.hidePane(tab, pane).then(() => {
            expect(pane.classList.contains('u-h')).toBe(true);
            expect(tabList.getAttribute('aria-selected')).toBe('false');

            NAV_CLASSES.forEach(className => {
                expect(tabList.classList.contains(className)).toBe(false);
            });
        })
    );
});

test('getTabTarget()', () => {
    const tab: HTMLElement = (document.getElementById('tab2'): any);

    return _.getTabTarget(tab).then(target => {
        expect(target).toBe('#tab2panel');
    });
});
