import _ from 'underscore';
import clone from 'utils/clean-clone';
import mockjax from 'test/utils/mockjax';
import EventEmitter from 'EventEmitter';

class Mock extends EventEmitter {

    constructor(path, urlParams, type) {
        super();
        // TODO I'd like to use default parameters, but this bug
        // https://github.com/babel/babel/issues/1405
        // makes the tests fail on phantom 1.9
        if (!urlParams) {
            urlParams = [];
        }
        if (!type) {
            type = 'get';
        }
        let me = this;
        let lastRequest;
        this.defaultResponse = {};
        this.mockID = mockjax({
            url: path,
            type: type,
            urlParams: urlParams,
            response: function (req) {
                lastRequest = req;
                this.responseText = me.handle(req, me.defaultResponse, this);
            },
            onAfterComplete: function () {
                me.emit('complete', lastRequest);
            }
        });
    }

    dispose() {
        mockjax.clear(this.mockID);
    }

    set(response) {
        this.defaultResponse = clone(response);
    }

    update(response) {
        _.extend(this.defaultResponse, clone(response));
    }

    handle() {
        // This is the method that should be implemented by subclasses
    }
}

export default Mock;
