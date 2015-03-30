define([
    'underscore',
    'sinon',
    'mock/lastmodified',
    'modules/vars',
    'utils/mediator',
    'utils/presser',
], function (
    _,
    sinon,
    mockLastModified,
    vars,
    mediator,
    presser
) {
    describe('Presser', function () {
        var ajax, mockPress, events;

        beforeEach(function () {
            jasmine.clock().install();
            ajax = sinon.spy();
            events = sinon.spy();

            mockPress = $.mockjax({
                url: /\/press\/([a-z]+)\/(.+)/,
                urlParams: ['env', 'front'],
                response: function (request) {
                    ajax(request.urlParams.env, request.urlParams.front);
                    this.responseText = {};
                }
            });

            mediator.on('presser:lastupdate', events);
        });

        afterEach(function () {
            ajax = null;
            $.mockjax.clear(mockPress);
            jasmine.clock().uninstall();
            mediator.off('presser:lastupdate', events);
            events = null;
        });

        it('presses draft', function () {
            presser.pressDraft('front/name');
            jasmine.clock().tick(100);
            expect(ajax.getCall(0).args).toEqual(['draft', 'front/name']);

            jasmine.clock().tick(vars.CONST.detectPressFailureMs + 10);
            expect(events.called).toBe(false);
        });

        it('presses live successfully', function () {
            // debounce uses the actual now() method, mock that one too
            var originalNow = _.now,
                currentTime = originalNow();

            _.now = function () {
                return currentTime;
            };
            presser.pressLive('cool/front');
            jasmine.clock().tick(100);
            expect(ajax.getCall(0).args).toEqual(['live', 'cool/front']);

            var now = new Date();
            mockLastModified.set({
                'cool/front': now.toISOString()
            });
            currentTime += vars.CONST.detectPressFailureMs + 10;
            jasmine.clock().tick(vars.CONST.detectPressFailureMs + 10);
            _.now = originalNow;
            expect(events.getCall(0).args).toEqual(['cool/front', now]);
        });
    });
});
