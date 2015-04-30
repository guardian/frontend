import _ from 'underscore';
import mockjax from 'test/utils/mockjax';
import EventEmitter from 'EventEmitter';

class Mock extends EventEmitter {

    constructor(path, urlParams=[], type='get') {
        let me = this;
        this.defaultResponse = {};
        this.mockID = mockjax({
            url: path,
            type: type,
            urlParams: urlParams,
            response: function (req) {
                this.responseText = me.handle(req, me.defaultResponse, this);
            },
            onAfterComplete: function () {
                me.emit('complete');
            }
        });
    }

    destroy() {
        mockjax.clear(this.mockID);
    }

    set(response) {
        this.defaultResponse = response;
    }

    update(response) {
        _.extend(this.defaultResponse, response);
    }

    handle() {
        // This is the method that should be implemented by subclasses
    }
}

export default Mock;
