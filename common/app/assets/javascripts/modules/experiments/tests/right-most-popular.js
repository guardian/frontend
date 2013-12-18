define([
    "modules/experiments/right-most-popular",
    'utils/mediator',
    'utils/detect'
], function(
    RightHandMostPopular,
    mediator,
    detect
    ) {

    return function() {

        this.id = 'RightMostPopular';
        this.expiry = '2013-12-31';
        this.audience = 0.45;
        this.audienceOffset = 0.7;
        this.description = 'Test whether a most popular component in RHS wil increase page views per session for desktop users';
        this.canRun = function(config) {
            return (detect.getBreakpoint() === 'wide' || detect.getBreakpoint() === 'desktop') && config.page.contentType === 'Article';
        };
        this.variants = [
            {
                id: 'Control',
                test: function () {}
            },
            {
                id: 'Trail-3',
                test: function () {
                    var r = new RightHandMostPopular(mediator, { type: 'image', maxTrails: 3 });
                }
            },
            {
                id: 'Trail-5',
                test: function () {
                    var r = new RightHandMostPopular(mediator, { type: 'image', maxTrails: 5 });
                }
            },
            {
                id: 'Trail-6',
                test: function () {
                    var r = new RightHandMostPopular(mediator, { type: 'image', maxTrails: 6 });
                }
            },
            {
                id: 'Trail-10',
                test: function () {
                    var r = new RightHandMostPopular(mediator, { type: 'image', maxTrails: 10 });
                }
            },
            {
                id: 'List-3',
                test: function () {
                    var r = new RightHandMostPopular(mediator, { type: 'list', maxTrails: 3 });
                }
            },
            {
                id: 'List-5',
                test: function () {
                    var r = new RightHandMostPopular(mediator, { type: 'list', maxTrails: 5 });
                }
            },
            {
                id: 'List-6',
                test: function () {
                    var r = new RightHandMostPopular(mediator, { type: 'list', maxTrails: 6 });
                }
            },
            {
                id: 'List-10',
                test: function () {
                    var r = new RightHandMostPopular(mediator, { type: 'list', maxTrails: 10 });
                }
            }
        ];
    };
});
