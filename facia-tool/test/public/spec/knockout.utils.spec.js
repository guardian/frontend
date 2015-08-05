import ko from 'knockout';
import asObservableProps from 'utils/as-observable-props';
import firstById from 'utils/find-first-by-id';
import populate from 'utils/populate-observables';
import remove from 'utils/remove-by-id';

describe('utils/as-observable-props', function () {
    it('generates observables', function () {
        var names = ['one', 'two', 'three'],
            props = asObservableProps(names);

        expect(Object.keys(props)).toEqual(names);
        names.forEach(function (name) {
            props[name]('test value: ' + name);
            expect(props[name]()).toBe('test value: ' + name);
        });
    });
});

describe('utils/find-first-by-id', function () {
    it('find by id', function () {
        var array = ko.observableArray();
        expect(firstById(array, 'banana')).toBe(null);

        array([{
            id: 'some',
            pos: 1
        }, {
            id: 'banana',
            pos: 2
        }]);
        expect(firstById(array, 'banana').pos).toBe(2);

        array([{
            id: ko.observable('banana'),
            pos: 1
        }, {
            id: 'banana',
            pos: 2
        }]);
        expect(firstById(array, 'banana').pos).toEqual(1);
    });
});

describe('utils/populate-observables', function () {
    it('populate observables', function () {
        var target = {
            one: ko.observable(),
            two: ko.observable(2),
            three: ko.observable('three'),
            four: ko.observable()
        },
        value = {

        };

        function toObj(host) {
            var obj = {};
            for (var key in host) {
                obj[key] = host[key]();
            }
            return obj;
        }

        expect(populate(target, null)).toBeUndefined();
        expect(populate(null, value)).toBeUndefined();

        populate(target, {});
        expect(toObj(target)).toEqual({
            one: undefined,
            two: 2,
            three: 'three',
            four: undefined
        });

        populate(target, {
            one: 'string',
            two: 'number',
            three: null,
            four: []
        });
        expect(toObj(target)).toEqual({
            one: 'string',
            two: 2,
            three: 'three',
            four: []
        });
    });
});

describe('utils/remove-by-id', function () {
    it('remove elements', function () {
        var array = ko.observableArray([{
            id: 'banana',
            pos: 1
        }, {
            id: ko.observable('banana'),
            pos: 2
        }, {
            id: 'apple',
            pos: 3
        }]);

        var removed = remove(array, 'banana');
        expect(array()).toEqual([{
            id: 'apple',
            pos: 3
        }]);
        expect(removed.pos).toBe(1);
    });
});
