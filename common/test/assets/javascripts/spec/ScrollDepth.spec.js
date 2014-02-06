define([
    'common/utils/mediator',
    'common/modules/analytics/scrollDepth'
], function(mediator, ScrollDepth) {

    var sd;

    beforeEach(function() {
        document.body.style.height = '2000px';
        dataCallback = sinon.spy();
        mediator.on('scrolldepth:data', dataCallback);

        sd = new ScrollDepth();
    });

    afterEach(function() {
        delete sd;
    });

    describe('Scroll depth', function() {

        it('should log page depth on scroll.', function() {
            mediator.emit('window:scroll');

            waitsFor(function () {
                return dataCallback.called === true;
            }, 'scroll data callback never called', 1500);

            runs(function(){
                expect(dataCallback.args[0][0].page.depth).toEqual(100);
            });
        });
    });

});