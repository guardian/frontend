import Mock from 'mock/generic-mock';

class Defaults extends Mock {
    constructor() {
        super('/frontend/config');
    }

    handle(req, data) {
        return data;
    }
}

export default Defaults;
