// @flow

import bonzo from 'bonzo';
import fastdom from 'fastdom';
import { getUserFromCookie } from 'common/modules/identity/api';

const CONFIG = {
    classes: {
        container: 'js-profile-nav',
        content: 'js-profile-info',
        popup: 'js-profile-popup',
        register: 'js-profile-register',
        commentActivity: 'js-comment-activity',
        action: 'brand-bar__item--action',
    },
};

class Profile {
    dom: {
        [key: string]: ?HTMLElement,
    };
    opts: {
        url: string,
    };

    constructor(options: Object): void {
        const opts = {
            url: 'https://profile.theguardian.com',
        };

        this.opts = Object.assign({}, opts, options);

        this.dom = {};

        if (document.body) {
            this.dom.container = document.body.getElementsByClassName(
                CONFIG.classes.container
            )[0];

            if (this.dom.container) {
                this.dom.content = this.dom.container.getElementsByClassName(
                    CONFIG.classes.content
                )[0];
            }
        }

        if (document.body) {
            this.dom.popup = document.body.getElementsByClassName(
                CONFIG.classes.popup
            )[0];
        }

        if (document.body) {
            this.dom.register = document.body.getElementsByClassName(
                CONFIG.classes.register
            )[0];
        }

        if (document.body) {
            this.dom.commentActivity = document.body.getElementsByClassName(
                CONFIG.classes.commentActivity
            )[0];
        }
    }

    init(): void {
        // setFragmentFromCookie
        const user = getUserFromCookie();
        const $container = bonzo(this.dom.container);
        const $content = bonzo(this.dom.content);
        const $register = bonzo(this.dom.register);
        const $commentActivity = bonzo(this.dom.commentActivity);
        if (user) {
            // Run this code only if we haven't already inserted
            // the username in the header
            if (!$container.hasClass('is-signed-in')) {
                fastdom.write(() => {
                    $content.text(user.displayName);
                    $container.addClass('is-signed-in');
                    $register.hide();
                });
            }
            $commentActivity.removeClass('u-h');
            $commentActivity.attr(
                'href',
                `${this.opts.url}/user/id/${user.id}`
            );
        }
    }
}

export { Profile };
