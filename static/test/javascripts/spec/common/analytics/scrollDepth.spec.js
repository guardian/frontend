define([
    'common/utils/mediator',
    'common/modules/analytics/scrollDepth'
], function (mediator, ScrollDepth) {

    describe('Scroll depth', function () {
        beforeEach(function () {
            document.body.style.height = '100px';
            /*eslint-disable no-new*/
            new ScrollDepth();
            /*eslint-enable no-new*/
        });

        it('should log page depth on scroll.', function (done) {

            mediator.on('scrolldepth:data', function (data) {
                expect(data.page.depth).toEqual(100);
                done();
            });

            window.scrollTo(0, 50);
            mediator.emit('window:throttledScroll');
        });

    });

});
