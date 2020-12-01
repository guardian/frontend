import bean from 'bean';
import $ from 'lib/$';
import { getUserAgent, isIOS } from 'lib/detect';
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';

const jsEnableFooterNav = (): Promise<void> =>
    fastdom.mutate(() => {
        $('.navigation-container--default')
            .removeClass('navigation-container--default')
            .addClass('navigation-container--collapsed');
    });

const copyMegaNavMenu = (): Promise<void> => {
    let megaNav;

    return fastdom
        .measure(() => $('.js-mega-nav'))
        .then((elem) => {
            megaNav = elem;

            return fastdom.measure(() => $('.js-mega-nav-placeholder'));
        })
        .then((placeholder) => {
            const megaNavCopy = $.create(megaNav.html());

            $('.global-navigation', megaNavCopy).addClass(
                'global-navigation--top'
            );

            if (placeholder) {
                return fastdom.mutate(() => {
                    placeholder.append(megaNavCopy);
                });
            }
        });
};

const replaceAllSectionsLink = (): Promise<void> =>
    fastdom
        .measure(() => $('.js-navigation-header .js-navigation-toggle'))
        .then((elems) =>
            fastdom.mutate(() => {
                elems.attr('href', '#nav-allsections');
            })
        );

const addOverflowScrollTouch = (): Promise<void> =>
    fastdom
        .measure(() => $('.navigation__scroll'))
        .then((navScroll) => {
            if (navScroll) {
                return fastdom.mutate(() => {
                    navScroll.css({
                        '-webkit-overflow-scrolling': 'touch',
                    });
                });
            }
        });

const enableMegaNavToggle = (): void => {
    bean.on(document, 'click', '.js-navigation-toggle', (e) => {
        const target = $(`.${e.currentTarget.getAttribute('data-target-nav')}`);

        e.preventDefault();

        fastdom.mutate(() => {
            target.toggleClass(
                'navigation-container--expanded navigation-container--collapsed'
            );
            mediator.emit(
                target.hasClass('navigation-container--expanded')
                    ? 'modules:nav:open'
                    : 'modules:nav:close'
            );
        });
    });
};

const initNavigation = (): Promise<any> => {
    enableMegaNavToggle();

    const modifications = [
        jsEnableFooterNav(),
        copyMegaNavMenu(),
        replaceAllSectionsLink(),
    ];

    if (
        isIOS() &&
        typeof getUserAgent === 'object' &&
        parseInt(getUserAgent.version, 10) > 5
    ) {
        // crashes mobile safari < 6, so we add it here after detection
        modifications.push(addOverflowScrollTouch());
    }

    return Promise.all(modifications);
};

export { initNavigation };
