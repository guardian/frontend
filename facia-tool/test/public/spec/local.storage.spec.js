import * as storage from 'utils/local-storage';

describe('Local Storage', function () {
    beforeEach(function () {
        localStorage.clear();
    });

    it('retrieves with defaults', function () {
        var memory = storage.bind('test-location'),
            value;

        value = memory.getItem('default value');
        expect(value).toEqual('default value');

        value = memory.getItem({
            an: 'object'
        });
        expect(value).toEqual({
            an: 'object'
        });

        memory.setItem('stored');
        value = memory.getItem('default value');
        expect(value).toEqual('stored');

        memory.setItem({
            complex: 'object',
            containing: [{
                nested: 'stuff'
            }, true],
            and: 12
        });
        value = memory.getItem({
            an: 'object'
        });
        expect(value).toEqual({
            complex: 'object',
            containing: [{
                nested: 'stuff'
            }, true],
            and: 12
        });
    });

    it('removes some error', function () {
        var memory = storage.bind('test-location'),
            value;

        localStorage.setItem('test-location', 'something that is not JSON');
        value = memory.getItem('default');
        expect(value).toEqual('default');
        expect(localStorage.getItem('test-location')).toEqual(null);
    });
});
