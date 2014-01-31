/* global _: true */
define([
    'config',
    'knockout',
    'modules/vars',
    'modules/authed-ajax'
], function(
    config,
    ko,
    vars,
    authedAjax
) {
    return function() {
        var self = this,
            model = {
                config: ko.observable(),
                collections: ko.observableArray(),
                fronts: ko.observableArray(),
                front:  ko.observable(),

                splat: ko.observable()
            };

        function terminate() {
            window.location.href = '/logout';
        }

        function terminateWithMessage(msg) {
            window.alert("Please contact support. Error: " + (msg || 'unknown'));
            terminate();
        }

        function fetchConfig(terminateOnFail) {
            return authedAjax.request({
                url: vars.CONST.apiBase + '/config'
            })
            .fail(function () {
                if(terminateOnFail) {
                    terminateWithMessage("the config was not available");
                }
            })
            .done(function(resp) {
                if (_.isObject(resp.fronts) && _.isObject(resp.collections)) {
                    model.config(resp);
                    model.fronts(_.keys(resp.fronts));
                } else if (terminateOnFail ) {
                    terminateWithMessage("the config is invalid.");
                }
            });
        }

        function fetchSwitches(terminateOnFail) {
            return authedAjax.request({
                url: vars.CONST.apiBase + '/switches'
            })
            .fail(function () {
                if(terminateOnFail) {
                    terminateWithMessage("the switches are unavailable");
                }
            })
            .done(function(switches) {
                if (switches['facia-tool-disable']) {
                    terminate();
                }
                vars.state.switches = switches || {};
            });
        }

        this.init = function() {
            $.when(fetchConfig(true), fetchSwitches(true))
            .done(function(){
                model.splat(JSON.stringify(model.config(), undefined, 2));

                ko.applyBindings(model);
            });

        };
    };
});
