// @flow

import bean from 'bean';
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';
import { isIOS, getUserAgent } from 'lib/detect';
import $ from 'lib/$';

const jsEnableFooterNav = (): Promise<void> =>
    fastdom.write(() => {
        $('.navigation-container--default')
            .removeClass('navigation-container--default')
            .addClass('navigation-container--collapsed');
    });

const copyMegaNavMenu = (): Promise<void> => {
    let megaNav;

    return fastdom
        .read(() => $('.js-mega-nav'))
        .then(elem => {
            megaNav = elem;

            return fastdom.read(() => $('.js-mega-nav-placeholder'));
        })
        .then(placeholder => {
            const megaNavCopy = $.create(megaNav.html());

            $('.global-navigation', megaNavCopy).addClass(
                'global-navigation--top'
            );

            if (placeholder) {
                return fastdom.write(() => {
                    placeholder.append(megaNavCopy);
                });
            }
        });
};

const replaceAllSectionsLink = (): Promise<void> =>
    fastdom
        .read(() => $('.js-navigation-header .js-navigation-toggle'))
        .then(elems =>
            fastdom.write(() => {
                elems.attr('href', '#nav-allsections');
            })
        );

const addOverflowScrollTouch = (): Promise<void> =>
    fastdom
        .read(() => $('.navigation__scroll'))
        .then(navScroll => {
            if (navScroll) {
                return fastdom.write(() => {
                    navScroll.css({
                        '-webkit-overflow-scrolling': 'touch',
                    });
                });
            }
        });

const enableMegaNavToggle = (): void => {
    bean.on(document, 'click', '.js-navigation-toggle', e => {
        const target = $(`.${e.currentTarget.getAttribute('data-target-nav')}`);

        e.preventDefault();

        fastdom.write(() => {
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

const getDiscountCodePath = (path: string): string => {
    const firstPart = path.split('/')[1];
    if (firstPart === 'us' || firstPart === 'us-news') {
        return 'us';
    } else if (firstPart === 'uk' || firstPart === 'uk-news') {
        return 'uk';
    } else if (firstPart === 'au' || firstPart === 'australia-news') {
        return 'au';
    }
    return '';
};

const localiseDiscountCodeLinks = (): void => {
    const path = window.location.pathname;
    const discountCodeLinks = Array.from(
        document.getElementsByClassName('js-discount-code-link')
    );
    console.log(discountCodeLinks);
    discountCodeLinks.map((link: any) => {
        link.href += getDiscountCodePath(path);
        return true;
    });
};

const initNavigation = (): Promise<any> => {
    enableMegaNavToggle();
    localiseDiscountCodeLinks();

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

export { initNavigation, getDiscountCodePath };
