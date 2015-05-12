import Mock from 'mock/generic-mock';

class LastModified extends Mock {
    constructor() {
        super(/\/front\/lastmodified\/(.+)/, ['front']);
    }

    handle(req, data) {
        return data[req.urlParams.front] || {
            status: 'fail'
        };
    }
}

export default LastModified;
