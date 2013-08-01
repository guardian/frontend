define(['common', 'ajax', 'bonzo', 'modules/id'], function(common, ajax, bonzo, Id) {

    /**
     * @param {Object} config
     * @param {Element} context
     * @constructor
     */
    function Profile(context, config) {
        var container;
        this.context = context;
        this.config = common.extend(this.config, config);
        
        this.dom.container = context.querySelector('.' + Profile.CONFIG.classes.container);
        this.dom.content = this.dom.container.querySelector('.' + Profile.CONFIG.classes.content);
        this.dom.popup = context.querySelector('.' + Profile.CONFIG.classes.popup);
    }

    /** @type {Object.<string.*>} */
    Profile.CONFIG = {
        eventName: 'modules:profilenav',
        classes: {
            container: 'js-profile-nav',
            content: 'js-profile-info',
            popup: 'js-profile-nav-popup',
            signout: 'js-nav-signout'
        }
    };

    /** @type {Object.<string.*>} */
    Profile.prototype.config = {
        url: 'https://profile.theguardian.com',
        useCookie: true
    };

    /** @enum {Element} */
    Profile.prototype.dom = {};

    /** @type {Element|null} */
    Profile.prototype.context = null;

    /** @type {Element|null} */
    Profile.prototype.container = null;

    /** */
    Profile.prototype.init = function() {
        var self = this;
        
        common.mediator.on(Profile.CONFIG.eventName + ':loaded', function(resp) {
            self.renderControl(resp);
        });

        this.setFragmentFromCookie();
    };

    Profile.prototype.setFragmentFromCookie = function() {
        var user = Id.getUserFromCookie(),
            container = bonzo(this.dom.container),
            content = bonzo(this.dom.content),
            popup = bonzo(this.dom.popup);

        container.removeClass('js-hidden');
        content.html(user ? user.displayName : 'Sign in');
        popup.append('<a href="' + this.config.url + '/signout" class="pull-right box-indent ' + Profile.CONFIG.classes.signout + '">Sign out</a>');
        // this.emitLoadedEvent(resp);
    };

    /**
     * @param {Object} resp response from the server
     */
    Profile.prototype.emitLoadedEvent = function(resp) {
        common.mediator.emit(Profile.CONFIG.eventName + ':loaded', resp);
    };
    
    /**
     * @param {Object} resp response from the server
     */
    Profile.prototype.emitErrorEvent = function(resp) {
        common.mediator.emit(Profile.CONFIG.eventName + ':error', resp);
    };

    return Profile;

});
