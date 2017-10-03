import bean from 'bean';
import qwery from 'qwery';
import fastdom from 'fastdom';
import mediator from 'lib/mediator';
import detect from 'lib/detect';
import $ from 'lib/$';
const Navigation = {
    init() {
        this.jsEnableFooterNav();
        this.copyMegaNavMenu();
        this.enableMegaNavToggle();
        this.replaceAllSectionsLink();

        if (detect.isIOS() && detect.getUserAgent.version > 5) {
            // crashes mobile safari < 6, so we add it here after detection
            fastdom.write(() => {
                $('.navigation__scroll').css({
                    '-webkit-overflow-scrolling': 'touch'
                });
            });
        }
    },

    jsEnableFooterNav() {
        fastdom.write(() => {
            $('.navigation-container--default').removeClass('navigation-container--default').addClass('navigation-container--collapsed');
        });
    },

    copyMegaNavMenu() {
        const megaNavCopy = $.create($('.js-mega-nav').html()), placeholder = $('.js-mega-nav-placeholder');

        fastdom.write(() => {
            $('.global-navigation', megaNavCopy).addClass('global-navigation--top');
            placeholder.append(megaNavCopy);
        });
    },

    replaceAllSectionsLink() {
        $('.js-navigation-header .js-navigation-toggle').attr('href', '#nav-allsections');
    },

    enableMegaNavToggle() {
        bean.on(document, 'click', '.js-navigation-toggle', e => {
            const target = $('.' + e.currentTarget.getAttribute('data-target-nav'));

            e.preventDefault();
            fastdom.write(() => {
                target.toggleClass('navigation-container--expanded navigation-container--collapsed');
                mediator.emit(target.hasClass('navigation-container--expanded') ? 'modules:nav:open' : 'modules:nav:close');
            });
        });
    }
};

export default Navigation;
