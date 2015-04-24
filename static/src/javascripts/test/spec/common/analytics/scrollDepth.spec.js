define([
    'common/utils/mediator',
    'common/modules/analytics/scrollDepth'
], function(mediator, ScrollDepth) {

    var sd;

    beforeEach(function() {
        document.body.style.height = '10000px';
        dataCallback = sinon.spy();

        mediator.on('scrolldepth:data', dataCallback);

        sd = new ScrollDepth();
    });

    afterEach(function() {
        delete sd;
    });

    xdescribe('Scroll depth', function() {

        it('should log page depth on scroll.', function() {
            window.scrollTo(0, 4000);
            mediator.emit('window:scroll');

            waitsFor(function () {
                return dataCallback.called === true;
            }, 'scroll data callback to have been called', 4000);

            runs(function(){
                expect(dataCallback.args[0][0].page.depth).toEqual(100);
            });
        });
    });

});