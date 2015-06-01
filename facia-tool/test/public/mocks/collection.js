import Mock from 'mock/generic-mock';

class Collection extends Mock {
    constructor() {
        super(/collection\/(.+)/, ['collection']);
    }

    handle(req, data) {
        return data[req.urlParams.collection];
    }
}

export default Collection;
