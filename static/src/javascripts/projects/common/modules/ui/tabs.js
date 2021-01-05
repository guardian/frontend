import fastdom from 'lib/fastdom-promise';

const NAV_CLASSES = [
    'tabs__tab--selected',
    'tone-colour',
    'tone-accent-border',
];

const getTabTarget = (tab) =>
    fastdom.measure(() => tab.getAttribute('href'));

const hidePane = (tab, pane) => {
    const tabList = (tab.parentNode);

    return fastdom.mutate(() => {
        if (tabList) {
            tabList.setAttribute('aria-selected', 'false');
            NAV_CLASSES.forEach(className =>
                tabList.classList.remove(className)
            );
        }

        pane.classList.add('u-h');
    });
};

const showPane = (tab, pane) => {
    const tabList = (tab.parentNode);

    return fastdom.mutate(() => {
        if (tabList) {
            tabList.setAttribute('aria-selected', 'true');
            NAV_CLASSES.forEach(className => tabList.classList.add(className));
        }

        pane.classList.remove('u-h', 'modern-hidden');
        pane.focus();
    });
};

const init = () => {
    const findTabs = () =>
        fastdom.measure(() => Array.from(document.querySelectorAll('.tabs')));

    return findTabs().then(tabs => {
        tabs.forEach(tab => {
            const nav = tab.querySelector('.js-tabs');

            if (!nav) {
                return;
            }

            const { tabsInitialized } = nav.dataset;

            if (tabsInitialized === 'true') {
                return;
            }

            fastdom.mutate(() => {
                nav.setAttribute('data-tabs-initialized', 'true');
            });

            nav.addEventListener('click', (event) => {
                const target = (event.target);

                if (!target || target.nodeName !== 'A') {
                    return;
                }

                event.preventDefault();

                const currentTab = tab.querySelector('.tabs__tab--selected a');

                getTabTarget(target).then(nextPaneTarget => {
                    if (nextPaneTarget) {
                        const nextPane = tab.querySelector(nextPaneTarget);

                        if (nextPane) {
                            showPane(target, nextPane);
                        }
                    }
                });

                if (currentTab) {
                    getTabTarget(currentTab).then(currentPaneTarget => {
                        if (currentPaneTarget) {
                            const currentPane = tab.querySelector(
                                currentPaneTarget
                            );

                            if (currentPane && target !== currentTab) {
                                hidePane(currentTab, currentPane);
                            }
                        }
                    });
                }
            });

            return fastdom.mutate(() => {
                nav.setAttribute('data-tabs-initialized', 'true');
            });
        });
    });
};

export { init };

export const _ = {
    showPane,
    hidePane,
    getTabTarget,
};
