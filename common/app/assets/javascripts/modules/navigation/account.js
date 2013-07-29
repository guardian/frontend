/**
 * TODO(james): Make this use JSON when the controller supports it
 */
define(['common', 'ajax', 'bonzo'], function (common, ajax, bonzo) {

    function Account(context) {
        this.context = context;
    }

    /**
     * @enum {string}
     */
    Account.CONFIG = {
        contentUrl: '/identity/fragments/account-nav',
        classes: {
            container: 'control--account',
            content: 'js-account-info'
        },
        eventName: 'modules:accountcontrol'
    };

    /** @type {Element|null} */
    Account.prototype.context = null;

    /**
     * @return {Element}
     */
    Account.prototype.getAccountFragment = function() {
        return ajax({
            url: Account.CONFIG.contentUrl,
            type: 'html'
        }).then(this.emitLoadedEvent, this.emitErrorEvent);
    };

    /** */
    Account.prototype.init = function() {
        var self = this;
        
        common.mediator.on(Account.CONFIG.eventName + ':loaded', function(resp) {
            self.renderControl(resp);
        });
        this.getAccountFragment();
    };

    /** */
    Account.prototype.renderControl = function(resp) {
        var content = resp,
            contentElem = this.context.querySelector('.' + Account.CONFIG.classes.content),
            container = this.context.querySelector('.' + Account.CONFIG.classes.container);

        bonzo(container).removeClass('js-hidden');
        bonzo(contentElem).html(content);
        common.mediator.emit(Account.CONFIG.eventName + ':rendered', resp);
    };

    /**  */
    Account.prototype.emitLoadedEvent = function(resp) {
        common.mediator.emit(Account.CONFIG.eventName + ':loaded', resp);
    };

    /** */
    Account.prototype.emitErrorEvent = function(resp) {
        common.mediator.emit(Account.CONFIG.eventName + ':error', resp);
    };

    return Account;

});
