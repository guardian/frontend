define([
    'helpers/injector'
], function (
    Injector
) {
    describe('interaction-tracking', function () {

        var google, omniture, mediator, interactionTracking, injector;

        beforeEach(function (done) {
            injector = new Injector();
            injector
                .mock('common/modules/analytics/google', {
                    trackSamePageLinkClick: sinon.spy(),
                    trackExternalLinkClick: sinon.spy()
                })
                .mock('common/modules/analytics/omniture', {
                    go: sinon.spy(),
                    trackSamePageLinkClick: sinon.spy(),
                    trackExternalLinkClick: sinon.spy()
                })
                .require([
                    'common/utils/mediator',
                    'common/modules/analytics/google',
                    'common/modules/analytics/omniture',
                    'common/modules/analytics/interaction-tracking'
                ], function () {
                    mediator = arguments[0];
                    google = arguments[1];
                    omniture = arguments[2];
                    interactionTracking = arguments[3];

                    done();
                });
        });

        afterEach(function () {
            sessionStorage.removeItem('gu.analytics.referrerVars');
            mediator.removeEvent('module:clickstream:interaction');
            mediator.removeEvent('module:clickstream:click');
        });

        it('should log a clickstream event for an in-page link', function () {
            interactionTracking.init();

            var clickSpec = {
                target: document.documentElement,
                samePage: true,
                sameHost: true,
                validTarget: true,
                tag: true
            };

            mediator.emit('module:clickstream:click', clickSpec);

            expect(google.trackSamePageLinkClick).toHaveBeenCalledOnce();
            expect(omniture.trackSamePageLinkClick).toHaveBeenCalledOnce();
        });

        it('should not log clickstream events with an invalidTarget', function () {
            interactionTracking.init();

            var clickSpec = {
                target: document.documentElement,
                samePage: true,
                sameHost: true,
                validTarget: false,
                tag: true
            };

            mediator.emit('module:clickstream:click', clickSpec);

            expect(google.trackSamePageLinkClick.callCount).toBe(0);
            expect(omniture.trackSamePageLinkClick.callCount).toBe(0);
        });

        it('should use local storage for same-host links', function () {
            interactionTracking.init({ location: { pathname: '/foo/bar' }});

            var el        = document.createElement('a'),
                clickSpec = {
                    target: el,
                    samePage: false,
                    sameHost: true,
                    validTarget: true,
                    tag: 'tag in localstorage'
                };

            mediator.emit('module:clickstream:click', clickSpec);

            expect(JSON.parse(sessionStorage.getItem('gu.analytics.referrerVars')).value.tag).toEqual('tag in localstorage');
            expect(JSON.parse(sessionStorage.getItem('gu.analytics.referrerVars')).value.path).toEqual('/foo/bar');
        });

        it('should log a clickstream event for an external link', function () {
            interactionTracking.init();

            var el        = document.createElement('a'),
                clickSpec = {
                    target: el,
                    samePage: false,
                    sameHost: false,
                    validTarget: true,
                    tag: 'tag'
                };

            mediator.emit('module:clickstream:click', clickSpec);

            expect(google.trackExternalLinkClick).toHaveBeenCalledOnce();
            expect(omniture.trackExternalLinkClick).toHaveBeenCalledOnce();
        });
    });
});
