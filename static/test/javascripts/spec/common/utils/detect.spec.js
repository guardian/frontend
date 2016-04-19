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

        it('get the current breakpoint', function () {
            this.viewportWidth = 100;
            expect(detect.getBreakpoint()).toBe('mobile');
            this.viewportWidth = 500;
            expect(detect.getBreakpoint()).toBe('mobile');
            this.viewportWidth = 1000;
            expect(detect.getBreakpoint()).toBe('desktop');

            // tweak point
            this.viewportWidth = 100;
            expect(detect.getBreakpoint(true)).toBe('mobile');
            this.viewportWidth = 500;
            expect(detect.getBreakpoint(true)).toBe('mobileLandscape');
            this.viewportWidth = 1000;
            expect(detect.getBreakpoint(true)).toBe('desktop');
        });

        it('is a given breakpoint', function () {
            this.viewportWidth = 100;
            expect(detect.isBreakpoint({ min: 'mobile' })).toBe(true);
            expect(detect.isBreakpoint({ min: 'tablet' })).toBe(false);
            expect(detect.isBreakpoint({ max: 'mobile' })).toBe(true);
            expect(detect.isBreakpoint({ max: 'desktop' })).toBe(true);

            this.viewportWidth = 500;
            expect(detect.isBreakpoint({ min: 'mobile' })).toBe(true);
            expect(detect.isBreakpoint({ min: 'tablet' })).toBe(false);
            // this is false because of the tweak point
            expect(detect.isBreakpoint({ max: 'mobile' })).toBe(false);
            expect(detect.isBreakpoint({ max: 'desktop' })).toBe(true);

            this.viewportWidth = 800;
            expect(detect.isBreakpoint({ min: 'mobile' })).toBe(true);
            expect(detect.isBreakpoint({ min: 'tablet' })).toBe(true);
            expect(detect.isBreakpoint({ max: 'mobile' })).toBe(false);
            expect(detect.isBreakpoint({ max: 'desktop' })).toBe(true);

            this.viewportWidth = 1000;
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

