define([
    'bean',
    'bonzo',
    'fastdom',
    'common/utils/config',
    'common/utils/_',
    'common/utils/ajax',
    'common/utils/mediator',
    'common/modules/identity/api'
], function (
    bean,
    bonzo,
    fastdom,
    config,
    _,
    ajax,
    mediator,
    id
) {

    /**
     * @param {Object} config
     * @constructor
     */
    function Profile(options) {
        this.opts = _.assign(this.opts, options);
        this.dom.container = document.body.querySelector('.' + Profile.CONFIG.classes.container);
        this.dom.content = this.dom.container.querySelector('.' + Profile.CONFIG.classes.content);
        this.dom.popup = document.body.querySelector('.' + Profile.CONFIG.classes.popup);
        this.dom.register = document.body.querySelector('.' + Profile.CONFIG.classes.register);
    }

    /** @type {Object.<string.*>} */
    Profile.CONFIG = {
        eventName: 'modules:profilenav',
        classes: {
            container: 'js-profile-nav',
            content: 'js-profile-info',
            popup: 'js-profile-popup',
            register: 'js-profile-register',
            action: 'brand-bar__item--action'
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
            $register = bonzo(this.dom.register),
            $profileLink = bonzo(this.dom.profileLink);

        if (user) {
            // Run this code only if we haven't already inserted
            // the username in the header
            if (!$container.hasClass('is-signed-in')) {
                fastdom.write(function () {
                    $content.text(user.displayName);
                    $container.addClass('is-signed-in');
                    $register.hide();
                });
            }
        }

        this.emitLoadedEvent(user);
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
