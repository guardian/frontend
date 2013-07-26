define(['common', 'ajax', 'bonzo'], function (common, ajax, bonzo) {

    function Account(context) {
        this.context = context;
    }

    /**
     * @enum {string}
     */
    Account.CONFIG = {
        contentUrl: '/identity/fragments/account',
        className: 'js-account-info',
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
            type: 'json'
        }).then(this.emitLoadedEvent, this.emitErrorEvent);
    };

    /**
     * @param {Element} context
     */
    Account.prototype.render = function(context, callback) {
        var self = this;
        common.mediator.on(Account.CONFIG.eventName + ':loaded', function(resp) {
            self.renderControl(resp);
        });
        this.getAccountFragment();
    };

    /** */
    Account.prototype.renderControl = function(resp) {
        var content = resp.html,
            container = this.context.querySelector('.' + Account.CONFIG.className);

        bonzo(container).html(content);

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
