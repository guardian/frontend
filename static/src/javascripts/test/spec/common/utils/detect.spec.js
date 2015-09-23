import detect from 'common/utils/detect';

describe('Connection speed', function () {

    it('should default to \'high\' speed', function () {
        window.performance = null;
        expect(detect.getConnectionSpeed()).toBe('high');
    });

    it('should calculate the speed of a slow, medium & fast client request', function () {

        expect(detect.getConnectionSpeed({ timing: { requestStart: 1, responseEnd: 8000 } })).toBe('low');

        expect(detect.getConnectionSpeed({ timing: { requestStart: 1, responseEnd: 3000 } })).toBe('medium');

        expect(detect.getConnectionSpeed({ timing: { requestStart: 1, responseEnd: 750 } })).toBe('high');

    });

    it('should return low if CELL connection can be determined', function () {

        expect(detect.getConnectionSpeed(null, { type: 3})).toBe('low'); // type 3 is CELL_2G

        expect(detect.getConnectionSpeed(null, { type: 4})).toBe('low'); // type 4 is CELL_3G

        expect(detect.getConnectionSpeed({ timing: { requestStart: 1, responseEnd: 750 } }, { type: 4})).toBe('low');

        expect(detect.getConnectionSpeed({ timing: { requestStart: 1, responseEnd: 8000 } }, { type: 6})).toBe('low');

        expect(detect.getConnectionSpeed({ timing: { requestStart: 1, responseEnd: 750 } }, { type: 6})).toBe('high');

    });

    it('should return high or unknown if the speed can\'t be determined', function () {

        expect(detect.getConnectionSpeed(null, null)).toBe('high');

        expect(detect.getConnectionSpeed(null, null, true)).toBe('unknown');

    });
});

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


