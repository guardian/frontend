import Mock from 'mock/generic-mock';

class StoriesVisible extends Mock {
    constructor() {
        super(/\/stories-visible\/(.+)/, ['collection']);
    }

    handle(req, data, xhr) {
        var response = data[req.urlParams.collection];
        if (!response) {
            xhr.status = 500;
            xhr.statusText = 'FAIL';
        }
        return response;
    }
}

export default StoriesVisible;
