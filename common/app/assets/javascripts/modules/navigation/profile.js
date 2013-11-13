define(['common', 'ajax', 'bonzo', 'modules/id'], function(common, ajax, bonzo, Id) {

    /**
     * @param {Object} config
     * @param {Element} context
     * @constructor
     */
    function Profile(context, config) {
        this.context = context;
        this.config = common.extend(this.config, config);
        
        this.dom.container = context.querySelector('.' + Profile.CONFIG.classes.container);
        this.dom.content = this.dom.container.querySelector('.' + Profile.CONFIG.classes.content);
        this.dom.popup = context.querySelector('.' + Profile.CONFIG.classes.popup);
    }

    /** @type {Object.<string.*>} */
    Profile.CONFIG = {
        signinText: 'Sign in',
        eventName: 'modules:profilenav',
        classes: {
            container: 'js-profile-nav',
            content: 'js-profile-info',
            popup: 'js-profile-nav-popup',
            signout: 'js-nav-signout',
            emailPrefs: 'js-nav-emailPrefs'
        }
    };

    /** @type {Object.<string.*>} */
    Profile.prototype.config = {
        url: 'https://profile.theguardian.com'
    };

    /** @enum {Element} */
    Profile.prototype.dom = {};

    /** @type {Element|null} */
    Profile.prototype.context = null;

    /** */
    Profile.prototype.init = function() {
        var self = this;
        
        this.setFragmentFromCookie();
    };

    Profile.prototype.setFragmentFromCookie = function() {
        var user = Id.getUserFromCookie(),
            $container = bonzo(this.dom.container),
            $content = bonzo(this.dom.content),
            $popup = bonzo(this.dom.popup);

        $container.removeClass('js-hidden');
        $content.html(user ? user.displayName : Profile.CONFIG.signinText);

        if (user) {
            $container.addClass('is-signed-in');
            $popup.html(
                '<a href="' + this.config.url + '/signout" class="pull-right box-indent ' + Profile.CONFIG.classes.signout + '">Sign out</a>'
                    +
                '<a href="' + this.config.url + '/email-prefs" class="pull-right box-indent ' + Profile.CONFIG.classes.emailPrefs + '">Email preferences</a>'
            );
        } else {
            $popup.remove();
        }

        this.emitLoadedEvent(user);
    };

    /**
     * @param {Object} resp response from the server
     */
    Profile.prototype.emitLoadedEvent = function(user) {
        common.mediator.emit(Profile.CONFIG.eventName + ':loaded', user);
    };
    
    /**
     * @param {Object} resp response from the server
     */
    Profile.prototype.emitErrorEvent = function() {
        common.mediator.emit(Profile.CONFIG.eventName + ':error');
    };

    return Profile;

});
