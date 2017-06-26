// @flow

import $ from 'lib/$';
import bean from 'bean';
import fastdom from 'fastdom';

const toggleDisplay = (event?: Event): void => {
    if (event) {
        event.preventDefault();
    }

    $('.js-social__secondary').each(icon => {
        fastdom.write(() => {
            $(icon).toggleClass('social--hidden');
        });
    });

    $('.js-social--top').each(topSocial => {
        fastdom.write(() => {
            $(topSocial).toggleClass('social--expanded-top');
        });
    });
};

const hiddenShareToggle = (): void => {
    $('.js-social__item--more, .js-social__tray-close').each(toggle => {
        bean.on(toggle, 'click', toggleDisplay);
    });

    bean.on(document.body, 'click', e => {
        if (
            $.ancestor(e.target, 'js-social--top') ||
            !$('.js-social--top').hasClass('social--expanded-top')
        ) {
            return;
        }

        toggleDisplay();
    });

    fastdom.write(() => {
        $('.js-social__item--more').toggleClass('social--hidden');
    });
};

export { hiddenShareToggle };
