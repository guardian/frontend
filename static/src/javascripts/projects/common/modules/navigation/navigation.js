// @flow

import bean from 'bean';
import fastdom from 'lib/fastdom-promise';
import mediator from 'lib/mediator';
import { isIOS, getUserAgent } from 'lib/detect';
import $ from 'lib/$';

const jsEnableFooterNav = (): void => {
    fastdom.write(() => {
        $('.navigation-container--default')
            .removeClass('navigation-container--default')
            .addClass('navigation-container--collapsed');
    });
};

const copyMegaNavMenu = (): void => {
    fastdom.read(() => $('.js-mega-nav')).then(megaNav => {
        if (megaNav) {
            const megaNavCopy = $.create(megaNav.html());

            fastdom
                .read(() => $('.js-mega-nav-placeholder'))
                .then(placeholder => {
                    if (placeholder) {
                        fastdom.write(() => {
                            $('.global-navigation', megaNavCopy).addClass(
                                'global-navigation--top'
                            );
                            placeholder.append(megaNavCopy);
                        });
                    }
                });
        }
    });
};

const replaceAllSectionsLink = (): void => {
    $('.js-navigation-header .js-navigation-toggle').attr(
        'href',
        '#nav-allsections'
    );
};

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

const initNavigation = (): void => {
    jsEnableFooterNav();
    copyMegaNavMenu();
    enableMegaNavToggle();
    replaceAllSectionsLink();

    if (
        isIOS() &&
        typeof getUserAgent === 'object' &&
        parseInt(getUserAgent.version, 10) > 5
    ) {
        // crashes mobile safari < 6, so we add it here after detection
        fastdom.write(() => {
            $('.navigation__scroll').css({
                '-webkit-overflow-scrolling': 'touch',
            });
        });
    }
};

export { initNavigation };
