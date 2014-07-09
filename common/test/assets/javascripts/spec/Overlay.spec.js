define(['common/utils/$', 'common/utils/mediator', 'common/modules/ui/overlay', 'bean'], function($, mediator, Overlay, bean) {

    describe("Overlay", function() {

        var overlay;

        beforeEach(function() {
            $('.overlay').remove();
            overlay = new Overlay();
        });

        it("should create a DOM element in the body", function() {
            expect(document.querySelectorAll('.overlay').length).toBe(1);
        });

        it("should be hidden to start with", function() {
            expect(document.querySelector('.overlay').style.display).toBe('none');
        });

        it("should display on show()", function() {
            overlay.show();
            expect(document.querySelector('.overlay').style.display).toBe('block');
        });

        it("should hide on hide()", function() {
            overlay.show();
            overlay.hide();
            expect(document.querySelector('.overlay').style.display).toBe('none');
        });

        it("should have the 'loading' animation by default", function() {
            overlay.show();
            expect(document.querySelectorAll('.overlay .is-updating').length).toBe(1);
        });

        it("should allow access to the toolbar and body elements", function() {
            overlay.toolbarNode.innerHTML = "<p>testing toolbar access</p>";
            expect(document.querySelector('.overlay__toolbar').innerHTML).toContain('testing toolbar access');

            overlay.bodyNode.innerHTML = "<p>testing body access</p>";
            expect(document.querySelector('.overlay__body').innerHTML).toContain('testing body access');
        });

        it("setBody() should update the content area", function() {
            overlay.setBody("<p>testing body access</p>");
            expect(document.querySelector('.overlay__body').innerHTML).toContain('testing body access');
        });

        it("should have the 'loading' animation by default", function() {
            overlay.show();
            expect(document.querySelectorAll('.overlay .is-updating').length).toBe(1);
        });

        it("should have put the 'loading' animation when called with .showLoading()", function() {
            overlay.show();
            overlay.bodyNode.innerHTML = "<p>test html</p>";
            overlay.showLoading();
            expect(document.querySelectorAll('.overlay .is-updating').length).toBe(1);
        });


        it("should hide when the 'Close' CTA is clicked", function() {
            overlay.show();
            bean.fire(document.querySelector('.js-overlay-close'), 'click');
            expect(document.querySelector('.overlay').style.display).toBe('none');
        });

        // TODO (jamesgorrie): Fix this. Karma can't work this out as it's in an iFrame
        xit("should return window to previous scroll pos after close", function() {
            window.scrollTo(0,100);
            overlay.show();
            bean.fire(document.querySelector('.js-overlay-close'), 'click');
            waits(200);
            runs(function() {
                expect(window.pageYOffset).toBe(100);
            });
        });

        it("should fire the appropriate mediator events (show/hide/close)", function() {
            sinon.spy(mediator, 'emit');

            overlay.show();
            expect(mediator.emit).toHaveBeenCalledWith('modules:overlay:show');

            overlay.hide();
            expect(mediator.emit).toHaveBeenCalledWith('modules:overlay:hide');

            bean.fire(document.querySelector('.js-overlay-close'), 'click');
            expect(mediator.emit).toHaveBeenCalledWith('modules:overlay:close');

            mediator.emit.restore();
        });

        it("should delete itself from the DOM on remove()", function() {
            overlay.remove();
            expect(document.querySelector('.overlay')).toBeNull();
        });

    });
});
