// @flow

import fastdom from 'lib/fastdom-promise';

const NAV_CLASSES = [
    'tabs__tab--selected',
    'tone-colour',
    'tone-accent-border',
];

const getTabTarget = (tab: HTMLElement): ?string => tab.getAttribute('href');

const hidePane = (tab: HTMLElement, pane: HTMLElement): Promise<void> => {
    const tabList: HTMLElement = (tab.parentNode: any);

    return fastdom.write(() => {
        if (tabList) {
            tabList.setAttribute('aria-selected', 'false');
            NAV_CLASSES.forEach(className =>
                tabList.classList.remove(className)
            );
        }

        pane.classList.add('u-h');
    });
};

const showPane = (tab: HTMLElement, pane: HTMLElement): Promise<void> => {
    const tabList: HTMLElement = (tab.parentNode: any);

    return fastdom.write(() => {
        if (tabList) {
            tabList.setAttribute('aria-selected', 'true');
            NAV_CLASSES.forEach(className => tabList.classList.add(className));
        }

        pane.classList.remove('u-h', 'modern-hidden');
        pane.focus();
    });
};

const init = (): void => {
    const findTabs = (): Promise<Array<HTMLElement>> =>
        fastdom.read(() => [...document.querySelectorAll('.tabs')]);

    findTabs().then(tabs => {
        tabs.forEach(tab => {
            const nav = tab.querySelector('.js-tabs');

            if (!nav) {
                return;
            }

            const { tabsInitialized } = nav.dataset;

            if (tabsInitialized === 'true') {
                return;
            }

            fastdom.write(() => {
                nav.setAttribute('data-tabs-initialized', 'true');
            });

            nav.addEventListener('click', (event: Event) => {
                const target: HTMLElement = (event.target: any);

                if (!target || target.nodeName !== 'A') {
                    return;
                }

                event.preventDefault();

                const currentTab = tab.querySelector('.tabs__tab--selected a');
                const nextPaneTarget = getTabTarget(target);

                if (nextPaneTarget) {
                    const nextPane = tab.querySelector(nextPaneTarget);

                    if (nextPane) {
                        showPane(target, nextPane);
                    }
                }

                if (currentTab) {
                    const currentPaneTarget = getTabTarget(currentTab);

                    if (currentPaneTarget) {
                        const currentPane = tab.querySelector(
                            currentPaneTarget
                        );

                        if (currentPane) {
                            hidePane(currentTab, currentPane);
                        }
                    }
                }
            });
        });
    });
};

export { init };
