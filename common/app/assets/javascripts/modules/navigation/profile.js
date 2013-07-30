define(['common', 'ajax', 'bonzo'], function(common, ajax, bonzo) {

    /** @constructor */
    function Profile(context) {
        this.context = context;
    }

    /** @type {Object.<string.*>} */
    Profile.CONFIG = {
        contentUrl: '/identity/fragments/profile-nav.json',
        eventName: 'modules:profilenav',
        classes: {
            container: 'control--profile',
            content: 'js-profile-info'
        }
    };

    /** @type {Element|null} */
    Profile.prototype.context = null;

    /**
     * @return {Reqwest} the reqwest promise
     */
    Profile.prototype.getNavigationFragment = function() {
        return ajax({
            url: Profile.CONFIG.contentUrl,
            type: 'json'
        }).then(this.emitLoadedEvent, this.emitErrorEvent);
    };

    /**
     * @return {Reqwest} the reqwest promise
     */
    Profile.prototype.init = function() {
        var self = this;
        
        common.mediator.on(Profile.CONFIG.eventName + ':loaded', function(resp) {
            self.renderControl(resp);
        });
        return this.getNavigationFragment();
    };

    Profile.prototype.renderControl = function(resp) {
        var content = resp.html,
            contentElem = this.context.querySelector('.' + Profile.CONFIG.classes.content),
            container = this.context.querySelector('.' + Profile.CONFIG.classes.container);

        bonzo(container).removeClass('js-hidden');
        bonzo(contentElem).html(content);
        common.mediator.emit(Profile.CONFIG.eventName + ':rendered', content);
    };

    Profile.prototype.emitLoadedEvent = function(resp) {
        common.mediator.emit(Profile.CONFIG.eventName + ':loaded', resp);
    };
    
    Profile.prototype.emitErrorEvent = function(resp) {
        common.mediator.emit(Profile.CONFIG.eventName + ':error', resp);
    };

    return Profile;

});
