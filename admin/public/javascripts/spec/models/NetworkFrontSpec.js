define(['models/networkFront', 'Knockout', 'Common']).then(

    function  (NetworkFront, Knockout, Common) {

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

        describe('NetworkFront Model', function() {

            var networkFront;

            beforeEach(function() {
                spyOn(Common.mediator, 'addListener');
                networkFront = new NetworkFront;
            });

            it('property "editions" should be an observable array', function() {
                expect(Knockout.isObservable(networkFront.editions)).toEqual(true);
                expect(networkFront.editions() instanceof Array).toEqual(true);
            });

            it('"clear" method should handle "ui:networkfronttool:clear" event', function() {
                expect(Common.mediator.addListener).toHaveBeenCalledWith('ui:networkfronttool:clear', networkFront.clear);
            });

            it('"save" method should handle "ui:networkfronttool:save" event', function() {
                expect(Common.mediator.addListener).toHaveBeenCalledWith('ui:networkfronttool:save', networkFront.save);
            });

            using('initial data', [{'us': {'blocks': [{'title': 'foo'}]}}], function(data) {
                it('should create correct editions based on data', function() {
                });
            });

        });
    },

    function(e) {
        console.log('Something has gone wrong here with the curl.js loading', e);
    }
);
