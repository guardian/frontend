define([
    'bonzo',
    'common/utils/$',
    'common/utils/detect'
], function (
    bonzo,
    $,
    detect
) {
    describe('Breakpoint', function () {

        beforeEach(function () {
            this.originalGetViewport = detect.getViewport;
            this.viewportWidth = 0;
            detect.getViewport = function () {
                return {
                    width: this.viewportWidth
                };
            }.bind(this);
        });
        afterEach(function () {
            detect.getViewport = this.originalGetViewport;
        });

        var listeners = [];
        var mqRegex = /min\-width:(\d+)/;
        var mockWindow = {
            matchMedia: function (mq) {
                var matches = mq.match(mqRegex);
                var from = matches[1];
                return {
                    matches: false,
                    addListener: function (fn) {
                        listeners.push({
                            callback: fn,
                            from: from
                        });
                    }
                };
            }
        };

        function dispatchResize(viewportWidth) {
            var mqIndex = 0;
            while (mqIndex <= listeners.length - 1) {
                if (mqIndex < listeners.length - 1 && listeners[mqIndex + 1].from > viewportWidth) {
                    break;
                }
                mqIndex += 1;
            }
            listeners[mqIndex].callback({ matches: true });
        }

        it('get the current breakpoint', function () {
            detect.init(mockWindow);
            dispatchResize(100);
            expect(detect.getBreakpoint()).toBe('mobile');
            expect(detect.getBreakpoint(true)).toBe('mobile');
            dispatchResize(500);
            expect(detect.getBreakpoint()).toBe('mobile');
            expect(detect.getBreakpoint(true)).toBe('mobileLandscape');
            dispatchResize(1000);
            expect(detect.getBreakpoint()).toBe('desktop');
            expect(detect.getBreakpoint(true)).toBe('desktop');
        });

        it('is a given breakpoint', function () {
            detect.init(mockWindow);
            dispatchResize(100);
            expect(detect.isBreakpoint({ min: 'mobile' })).toBe(true);
            expect(detect.isBreakpoint({ min: 'tablet' })).toBe(false);
            expect(detect.isBreakpoint({ max: 'mobile' })).toBe(true);
            expect(detect.isBreakpoint({ max: 'desktop' })).toBe(true);

            dispatchResize(500);
            expect(detect.isBreakpoint({ min: 'mobile' })).toBe(true);
            expect(detect.isBreakpoint({ min: 'tablet' })).toBe(false);
            // this is false because of the tweak point
            expect(detect.isBreakpoint({ max: 'mobile' })).toBe(false);
            expect(detect.isBreakpoint({ max: 'desktop' })).toBe(true);

            dispatchResize(800);
            expect(detect.isBreakpoint({ min: 'mobile' })).toBe(true);
            expect(detect.isBreakpoint({ min: 'tablet' })).toBe(true);
            expect(detect.isBreakpoint({ max: 'mobile' })).toBe(false);
            expect(detect.isBreakpoint({ max: 'desktop' })).toBe(true);

            dispatchResize(1000);
            expect(detect.isBreakpoint({ min: 'mobile' })).toBe(true);
            expect(detect.isBreakpoint({ min: 'desktop' })).toBe(true);
            expect(detect.isBreakpoint({ max: 'tablet' })).toBe(false);
            expect(detect.isBreakpoint({ max: 'desktop' })).toBe(true);
            expect(detect.isBreakpoint({ min: 'mobile', max: 'tablet' })).toBe(false);
            expect(detect.isBreakpoint({ min: 'mobile', max: 'desktop' })).toBe(true);
            expect(detect.isBreakpoint({ min: 'tablet', max: 'wide' })).toBe(true);
        });
    });
});
