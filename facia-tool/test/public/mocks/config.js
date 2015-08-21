import _ from  'underscore';
import clone from 'utils/clean-clone';
import Mock from 'mock/generic-mock';

class Config extends Mock {
    constructor() {
        super('/config');
    }

    handle(req, data) {
        return data;
    }

    update(response) {
        _.extend(this.defaultResponse.fronts, clone(response.fronts));
        _.extend(this.defaultResponse.collections, clone(response.collections));
    }
}

export default Config;
