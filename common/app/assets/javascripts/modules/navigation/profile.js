define(['common', 'ajax', 'bonzo', 'modules/id'], function(common, ajax, bonzo, Id) {

    /**
     * @param {Object} config
     * @param {Element} context
     * @constructor
     */
    function Profile(context, config) {
        // TODO(James): Wondering about passing the whole config
        // Couples it a lot if we decide to use other bits
        // We should perhaps be a little more specific
        // i.e. pass the argument contentUrl
        this.context = context;
        this.config = common.extend(this.config, config);
    }

    /** @type {Object.<string.*>} */
    Profile.CONFIG = {
        eventName: 'modules:profilenav',
        classes: {
            container: 'control--profile',
            content: 'js-profile-info'
        }
    };

    /** @type {Object.<string.*>} */
    Profile.prototype.config = {
        url: 'https://profile.theguardian.com',
        useCookie: false
    };

    /** @type {Element|null} */
    Profile.prototype.context = null;

    /** */
    Profile.prototype.init = function() {
        var self = this;
        
        common.mediator.on(Profile.CONFIG.eventName + ':loaded', function(resp) {
            self.renderControl(resp);
        });

        if (this.config.useCookie) {
            this.setFragmentFromCookie();
        } else {
            this.getNavigationFragment();
        }
    };

    /**
     * @return {Reqwest} the reqwest promise
     */
    Profile.prototype.getNavigationFragment = function() {
        var url = this.config.url + '/fragments/profile-nav.json';

        return ajax({
            url: url,
            method: 'get',
            crossOrigin: true
        }).then(this.emitLoadedEvent, this.emitErrorEvent);
    };

    Profile.prototype.setFragmentFromCookie = function() {
        var user = Id.getUserFromCookie(),
            resp = { html: user ? user.displayName : 'Sign in' };

        this.emitLoadedEvent(resp);
    };

    /**
     * @param {Object} resp response from the server
     */
    Profile.prototype.renderControl = function(resp) {
        var content = resp.html,
            contentElem = this.context.querySelector('.' + Profile.CONFIG.classes.content),
            container = this.context.querySelector('.' + Profile.CONFIG.classes.container);

        bonzo(container).removeClass('js-hidden');
        bonzo(contentElem).html(content);
        common.mediator.emit(Profile.CONFIG.eventName + ':rendered', content);
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
