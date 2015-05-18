import _ from 'underscore';
import authedAjax from 'modules/authed-ajax';
import CONST from 'constants/defaults';
import Promise from 'Promise';

var endpoints = [{
    key: 'config',
    url: CONST.apiBase + '/config',
    validate: function (response) {
        if (!_.isObject(response.fronts) || !_.isObject(response.collections)) {
            return new Error('The config is invalid.');
        }
    }
}, {
    key: 'switches',
    url: CONST.apiBase + '/switches'
}, {
    key: 'defaults',
    url: CONST.frontendApiBase + '/config'
}];

function sendRequest (endpoint) {
    return new Promise(function (resolve, reject) {
        authedAjax.request({
            url: endpoint.url
        })
        .then(function (response) {
            var error = endpoint.validate && endpoint.validate(response);
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        }, function () {
            reject(new Error('The ' + endpoint.key + ' is invalid or unavailable'));
        });
    });
}

function formatResponses (allResponses) {
    var result = {};
    _.map(allResponses, function (response, index) {
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
    this.loadPromise = Promise.all(_.map(endpoints, sendRequest)).then(formatResponses);

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
    this.loadPromise.catch(callback);
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
    }, CONST.configSettingsPollMs || 60000);
};

Bootstrap.prototype.executeCallbacks = function (callbacks, result) {
    _.each(callbacks, function (fn) {
        fn(result);
    });
};

export default Bootstrap;
