define(['common', 'modules/swipe/ears', 'modules/swipe/bar'], function (common, ears, Bar) {

    var SwipeCtas = function () {

        var bar, initial = true;

        this.id = 'SwipeCtas';
        this.expiry = '2013-08-19';
        this.audience = 1;
        this.description = 'Tests whether adding call to actions for swipe will increase average page views';
        this.canRun = function(config) {
            return true;
        };
        this.variants = [
            {
                id: 'control',
                test: function (context) {
                    return true;
                }
            },
            {
                id: 'ears',
                test: function (context) {
                    common.mediator.on('module:swipenav:pane:loaded', function() {
                        if(initial) {
                            ears.init();
                            initial = false;
                        }
                    });
                }
            },
            {
                id: 'bar',
                test: function (context) {
                    common.mediator.on('module:swipenav:pane:loaded', function() {
                        if(initial) {
                            bar = new Bar();
                            initial = false;
                        }
                    });
                }
            }
        ];
    };

    return SwipeCtas;

});
