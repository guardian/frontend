define([
    'bean',
    'bonzo',
    'fastdom',
    'lodash/objects/assign',
    'common/utils/ajax',
    'common/utils/mediator',
    'common/modules/identity/api'
], function (
    bean,
    bonzo,
    fastdom,
    assign,
    ajax,
    mediator,
    id
) {

    /**
     * @param {Object} config
     * @constructor
     */
    function Profile(options) {
        this.opts = assign(this.opts, options);
        this.dom.container = document.body.querySelector('.' + Profile.CONFIG.classes.container);
        this.dom.content = this.dom.container.querySelector('.' + Profile.CONFIG.classes.content);
        this.dom.popup = document.body.querySelector('.' + Profile.CONFIG.classes.popup);
    }

    /** @type {Object.<string.*>} */
    Profile.CONFIG = {
        eventName: 'modules:profilenav',
        classes: {
            container: 'js-profile-nav',
            content: 'js-profile-info',
            popup: 'js-profile-popup'
        }
    };

    /** @type {Object.<string.*>} */
    Profile.prototype.opts = {
        url: 'https://profile.theguardian.com'
    };

    /** @enum {Element} */
    Profile.prototype.dom = {};

    /** */
    Profile.prototype.init = function () {
        this.setFragmentFromCookie();
    };

    Profile.prototype.setFragmentFromCookie = function () {
        var user = id.getUserFromCookie(),
            $container = bonzo(this.dom.container),
            $content = bonzo(this.dom.content),
            $popup = bonzo(this.dom.popup);

        if (user) {
            // Run this code only if we haven't already inserted
            // the username in the header
            if (!$container.hasClass('is-signed-in')) {
                fastdom.write(function () {
                    $content.text(user.displayName);
                    $container.addClass('is-signed-in');
                });
            }

            $popup.html(
                    '<ul class="popup popup__group popup--profile" data-link-name="Sub Sections" data-test-id="popup-profile">' +
                    this.menuListItem('Comment activity', this.opts.url + '/user/id/' + user.id) +
                    this.menuListItem('Edit profile', this.opts.url + '/public/edit') +
                    this.menuListItem('Email preferences', this.opts.url + '/email-prefs') +
                    this.menuListItem('Change password', this.opts.url + '/password/change') +
                    this.menuListItem('Sign out', this.opts.url + '/signout') +
                    '</ul>'
            );

        } else {
            fastdom.write(function () {
                $popup.remove();
            });
        }

        this.emitLoadedEvent(user);
    };

    Profile.prototype.menuListItem = function (text, url) {
        return '<li class="popup__item">' +
                   '<a href="' + url + '" class="brand-bar__item--action" data-link-name="' + text + '">' + text + '</a>' +
               '</li>';
    };

    /**
     * @param {Object} resp response from the server
     */
    Profile.prototype.emitLoadedEvent = function (user) {
        mediator.emit(Profile.CONFIG.eventName + ':loaded', user);
    };

    /**
     * @param {Object} resp response from the server
     */
    Profile.prototype.emitErrorEvent = function () {
        mediator.emit(Profile.CONFIG.eventName + ':error');
    };

    return Profile;

});
