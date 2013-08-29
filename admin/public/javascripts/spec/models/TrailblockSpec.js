define(['models/trailblock', 'knockout'], function(Trailblock, knockout) {

    /**
     * adding data provider pattern to jasmine - https://github.com/jphpsf/jasmine-data-provider
     */
    function using(name, values, func){
        for (var i = 0, count = values.length; i < count; i++) {
            if (Object.prototype.toString.call(values[i]) !== '[object Array]') {
                values[i] = [values[i]];
            }
            func.apply(this, values[i]);
            jasmine.currentEnv_.currentSpec.description += ' (with "' + name + '" using ' + values[i].join(', ') + ')';
        }
    }

    describe('Trailblock Model', function() {

        var trailblock;

        beforeEach(function() {
            trailblock = new Trailblock;
        });

        var props = {
            'type': 'tag',
            'numItems' : 3,
            'lead': true
        };
        for (var propName in props) {
            it('should have property "' + propName + '"', function() {
                expect(trailblock[propName]).toBeDefined();
            });

            var propValue = props[propName];
            it('"' + propName + '" property should be set to "' + propValue + '"', function() {
                expect(trailblock[propName]).toEqual(propValue);
            });
        }

        var observableProps = {
            'id': '',
            'title': ''
        };
        for (var observablePropName in observableProps) {
            it('should have property "' + observablePropName + '"', function() {
                expect(trailblock[observablePropName]).toBeDefined();
            });

            it('"' + observablePropName + '" property should be an observable', function() {
                expect(knockout.isObservable(trailblock[observablePropName])).toEqual(true);
            });

            var observablePropValue = observableProps[observablePropName];
            it('"' + observablePropName + '" property should be set to "' + observablePropValue + '" initially', function() {
                expect(trailblock[observablePropName]()).toEqual(observablePropValue);
            });
        }

        using('trailblock data', [{'title': 'foo'}], function(data) {
            it('update method should update trailblock with supplied data', function() {
                trailblock.update(data);
                for (var prop in data) {
                    expect(trailblock[prop]()).toEqual(data[prop]);
                }
            });
        });

        it('clear method should empty all observables', function() {
            // add some data
            trailblock.update({
                'id': 'bar',
                'title': 'foo',
                'numItems': 5,
            });
            // clear trialblock
            trailblock.clear();
            // make sure observables are all empty
            for (var name in observableProps) {
                expect(trailblock[name]()).toEqual('');
            }
        });

    });
});
