import * as fromURL from 'utils/layout-from-url';

describe('utils/layout-from-url', function () {
    it('gets the default configuration', function () {
        expect(fromURL.get('test')).toEqual([
            { 'type': 'latest' },
            { 'type': 'front' }
        ]);
    });

    it('gets the default configuration by path', function () {
        expect(fromURL.get('test', 'config')).toEqual([
            { 'type': 'config' },
            { 'type': 'config' }
        ]);
    });

    it('shows treats if required', function () {
        expect(fromURL.get('test?treats=please&front=banana&layout=front')).toEqual([
            { 'type': 'clipboard' },
            {
                'type': 'treats',
                'config': 'banana'
            }
        ]);
    });

    it('gets the configuration form URL', function () {
        expect(fromURL.get('test?layout=front,front:banana,treats:apple')).toEqual([
            {
                'type': 'front',
                'config': undefined
            }, {
                'type': 'front',
                'config': 'banana'
            }, {
                'type': 'treats',
                'config': 'apple'
            }
        ]);
    });

    it('gets an empty configuration', function () {
        expect(fromURL.get('test?layout=,,any')).toEqual([
            { 'type': 'front' },
            { 'type': 'front' },
            {
                'type': 'any',
                'config': undefined
            }
        ]);
    });

    it('gets the default configuration', function () {
        expect(fromURL.get('test?other=stuff')).toEqual([
            { 'type': 'latest' },
            { 'type': 'front' }
        ]);
    });

    it('respects the front parameter', function () {
        expect(fromURL.get('test?front=banana')).toEqual([
            { 'type': 'latest' },
            {
                'type': 'front',
                'config': 'banana'
            }
        ]);
    });

    it('respects the front parameter for the path', function () {
        expect(fromURL.get('test?front=banana', 'config')).toEqual([
            {
                'type': 'config',
                'config': 'banana'
            }
        ]);
    });

    it('gives priority to layout over front', function () {
        expect(fromURL.get('test?front=banana&layout=front:apple')).toEqual([
            {
                'type': 'front',
                'config': 'apple'
            }
        ]);
    });

    it('serializes a layout', function () {
        expect(fromURL.serialize([{
            type: 'latest',
            ignore: 'please'
        }, {
            type: 'front',
            config: 'banana'
        }])).toBe('latest,front:banana');
    });

    it('extract from an object', function () {
        expect(fromURL.get({
            front: 'banana'
        })).toEqual([{
            type: 'latest'
        }, {
            type: 'front',
            config: 'banana'
        }]);
    });
});
