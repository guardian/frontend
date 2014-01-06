define([
    'common/common',
    'common/utils/ajax',
    'bonzo',
    'common/modules/identity/api'
], function(
    common,
    ajax,
    bonzo,
    Id
) {

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
            emailPrefs: 'js-nav-emailPrefs',
            publicProfile: 'js-nav-publicProfile'
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
                '<ul class="nav nav--columns nav--top-border-off nav--additional-sections" data-link-name="Sub Sections">'+
                    this.menuListItem("Edit profile", this.config.url+'/profile/public', "publicProfile")+
                    this.menuListItem("Email preferences", this.config.url+'/email-prefs', "emailPrefs")+
                    this.menuListItem("Sign out", this.config.url+'/signout', "signout")+
                '</ul>'
            );
        } else {
            $popup.remove();
        }

        this.emitLoadedEvent(user);
    };

    Profile.prototype.menuListItem = function(text, url, className) {
        return  '<li class="nav__item">'+
                    '<a href="' + url + '/email-prefs" class="nav__link ' + Profile.CONFIG.classes[className] + '">' + text + '</a>'+
                '</li>';
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
