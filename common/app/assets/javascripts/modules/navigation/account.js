define(['common', 'ajax', 'bonzo'], function (common, ajax, bonzo) {

    function Account(context) {
        this.context = context;
    }

    /**
     * @enum {string} 
     */
    Account.CONFIG = {
        contentUrl: '/identity/fragments/account',
        className: 'control--account'
    }

    /**
     *
     */
    Account.prototype.context;

    /**
     * @param {Function} callback
     * @return {Element}
     */
    Account.prototype.getAccountFragment = function(callback) {
        ajax({
            url: Account.CONFIG.contentUrl,
            type: 'json'
        }).then(this.emitLoadedEvent, this.emitErrorEvent);
    }

    /**
     * @param {Element} context
     */
    Account.prototype.render = function(context) {
        this.getAccountFragment(function(resp) {
            console.log(resp)
        });
    }

    /**  */
    Account.prototype.emitLoadedEvent = function() {
        common.mediator.emit('modules:accountcontrol:loaded');
    }

    /** */
    Account.prototype.emitErrorEvent = function() {
        common.mediator.emit('modules:accountcontrol:error');
    }

    return Account;

});
