import Mock from 'mock/generic-mock';

class Histogram extends Mock {
    constructor() {
        super(/\/ophan\/histogram\?(.*)/, ['queryString']);
    }

    handle(req, data) {
        var front = req.urlParams.queryString.split('&').filter(function (param) {
            return param.split('=')[0] === 'referring-path';
        })[0].split('=')[1];
        return data[front] || {};
    }
}

export default Histogram;
