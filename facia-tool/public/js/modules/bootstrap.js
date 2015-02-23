define([
    'underscore',
    'jquery',
    'modules/authed-ajax',
    'modules/vars'
], function (
    _,
    $,
    authedAjax,
    vars
) {
    var endpoints = [{
        key: 'config',
        url: vars.CONST.apiBase + '/config',
        validate: function (response) {
            if (!_.isObject(response.fronts) || !_.isObject(response.collections)) {
                return new Error('The config is invalid.');
            }
        }
    }, {
        key: 'switches',
        url: vars.CONST.apiBase + '/switches'
    }];

    function sendRequest (endpoint) {
        var deferred = new $.Deferred();

        authedAjax.request({
            url: endpoint.url
        })
        .then(function (response) {
            var error = endpoint.validate && endpoint.validate(response);
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve(response);
            }
        }, function () {
            deferred.reject(new Error('The ' + endpoint.key + ' is invalid or unavailable'));
        });

        return deferred.promise();
    }

    function formatResponses () {
        var result = {};
        _.map(arguments, function (response, index) {
            result[endpoints[index].key] = response;
        });
        return result;
    }

    function Bootstrap () {
        this.loadPromise = null;
        this.onPollSuccess = [];
        this.onPollFail = [];

        this.get();
    }

    Bootstrap.prototype.get = function() {
        this.loadPromise = $.when.apply($, _.map(endpoints, sendRequest)).then(formatResponses);

        return this;
    };

    Bootstrap.prototype.every = function (callback, fail) {
        this.onPollSuccess.push(callback);
        this.onPollFail.push(fail);
        this.installInterval();
        this.onload(callback);
        return this;
    };

    Bootstrap.prototype.onload = function (callback) {
        this.loadPromise.then(callback);
        return this;
    };

    Bootstrap.prototype.onfail = function (callback) {
        this.loadPromise.fail(callback);
        return this;
    };

    Bootstrap.prototype.dispose = function () {
        clearInterval(this.pollingId);
        this.pollingId = null;
    };

    Bootstrap.prototype.installInterval = function () {
        if (this.pollingId) {
            clearInterval(this.pollingId);
        }
        var that = this;
        this.pollingId = setInterval(function () {
            that.get()
                .onload(_.bind(that.executeCallbacks, that, that.onPollSuccess))
                .onfail(_.bind(that.executeCallbacks, that, that.onPollFail));
        }, vars.CONST.configSettingsPollMs || 60000);
    };

    Bootstrap.prototype.executeCallbacks = function (callbacks, result) {
        _.each(callbacks, function (fn) {
            fn(result);
        });
    };

    return Bootstrap;
});
