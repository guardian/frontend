import mediator from 'common/utils/mediator';
import ScrollDepth from 'common/modules/analytics/scrollDepth';

describe('Scroll depth', function() {

    beforeEach(function(){
        document.body.style.height = '100px';
        var sd = new ScrollDepth();
    });

    it('should log page depth on scroll.', function(done) {

        mediator.on('scrolldepth:data', function (data){
            expect(data.page.depth).toEqual(100);
            done();
        });

        window.scrollTo(0, 50);
        mediator.emit('window:scroll');
    });
});
