import Mock from 'mock/generic-mock';

class Switches extends Mock {
    constructor() {
        super('/switches');
    }

    handle(req, data) {
        return data;
    }
}

export default Switches;
