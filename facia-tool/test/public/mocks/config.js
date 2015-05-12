import _ from  'underscore';
import Mock from 'mock/generic-mock';

class Config extends Mock {
    constructor() {
        super('/config');
    }

    handle(req, data) {
        return data;
    }

    update(response) {
        _.extend(this.defaultResponse.fronts, response.fronts);
        _.extend(this.defaultResponse.collections, response.collections);
    }
}

export default Config;
