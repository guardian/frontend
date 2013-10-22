define(['common',
        'ajax',
        'modules/lightbox-gallery',
        'bean',
        'helpers/fixtures',
        'fixtures/lightbox-gallery'],
    function(common,
             ajax,
             LightboxGallery,
             bean,
             fixtures,
             galleryResponse) {

    describe("Lightbox Gallery", function() {

        var $ = common.$g,
            server,
            historyStub,
            gallery,
            conf = {
                id: 'lightbox-gallery',
                fixtures: [
                    '<li class="trail trail--gallery">' +
                    '  <div class="gallerythumbs">' +
                    '    <a href="/link/to/gallery" class="">Trail to gallery</a>' +
                    '    <a href="/link/to/gallery?index=4" class="link-to-image">Trail to specific gallery image</a>' +
                    '  </div>' +
                    '</li>'
                ]
        };

        // setup ajax
        ajax.init({page: {
            ajaxUrl: "",
            edition: "UK"
        }});

        // fake config
        var config = {
            page: {
                pageId: 'path/to/page'
            },
            switches: {
                lightboxGalleries: true
            }
        };


        beforeEach(function() {
            // setup fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.autoRespondAfter = 20;
            server.respondWith(galleryResponse);

            historyStub = sinon.stub(history, 'pushState');
            sinon.spy(common.mediator, 'emit');

            fixtures.render(conf);

            common.$g('.overlay').remove();
            gallery = new LightboxGallery(config, document.getElementById('lightbox-gallery'));
            gallery.init();

            bean.fire(document.querySelector('.trail--gallery a'), 'click');
            waits(100);
        });

        afterEach(function() {
            server.restore();
            historyStub.restore();
            common.mediator.emit.restore();
        });


        it("should create a gallery within an overlay", function() {
            expect(document.querySelectorAll('.overlay .gallery').length).toBe(1);
        });


        it("should start in single image mode", function() {
            expect(document.querySelector('.gallery').className).toContain('gallery--full');

            var visibleImages = document.querySelectorAll('.gallery__item--active').length;

            expect(visibleImages).toBe(1);
        });

        it("should switch to thumbnail view and update the CTAs", function() {
            bean.fire(document.querySelector('.js-gallery-grid'), 'click');
            expect(document.querySelector('.gallery').className).not.toContain('gallery--fullimage-mode');
            expect(document.querySelector('.gallery').className).toContain('gallery--grid');
            expect(document.querySelector('.js-gallery-full').style.display).toBe('block');
            expect(document.querySelector('.js-gallery-grid').style.display).toBe('none');
        });

        it("should switch to full image view and update the CTAs", function() {
            bean.fire(document.querySelector('.js-gallery-grid'), 'click');
            bean.fire(document.querySelector('.js-gallery-full'), 'click');
            expect(document.querySelector('.gallery').className).toContain('gallery--fullimage-mode');
            expect(document.querySelector('.gallery').className).not.toContain('gallery--grid-mode');
            expect(document.querySelector('.js-gallery-full').style.display).toBe('none');
            expect(document.querySelector('.js-gallery-grid').style.display).toBe('block');
        });

        it("should enlarge an image when clicked on in grid view", function() {
            bean.fire(document.querySelector('.js-gallery-grid'), 'click');
            bean.fire(document.querySelector('.gallery .js-gallery-item-5'), 'click');


            expect(document.querySelector('.gallery').className).toContain('gallery--fullimage-mode');
            expect(document.querySelector('.gallery .js-gallery-item-5').className).toContain('gallery__item--active');
            expect(document.querySelector('.js-image-index').innerHTML).toBe('5');
        });

        it("should hide/show the furniture when clicking the caption toggle", function() {
            bean.fire(document.querySelector('.js-toggle-furniture'), 'click');
            expect(document.querySelector('.gallery').className).toContain('gallery--hide-furniture');
            bean.fire(document.querySelector('.js-toggle-furniture'), 'click');
            expect(document.querySelector('.gallery').className).not.toContain('gallery--hide-furniture');
        });


        it("should update the image counter on prev/next", function() {
            bean.fire(document.querySelector('.gallery .js-gallery-next'), 'click');
            expect(document.querySelector('.js-image-index').innerHTML).toBe('2');

            bean.fire(document.querySelector('.gallery .js-gallery-next'), 'click');
            expect(document.querySelector('.js-image-index').innerHTML).toBe('3');

            bean.fire(document.querySelector('.gallery .js-gallery-prev'), 'click');
            expect(document.querySelector('.js-image-index').innerHTML).toBe('2');
        });

        it("should loop around when going beyond the first/last image", function() {
            bean.fire(document.querySelector('.gallery .js-gallery-prev'), 'click');
            expect(document.querySelector('.js-image-index').innerHTML).toBe('12');
            bean.fire(document.querySelector('.gallery .js-gallery-next'), 'click');
            expect(document.querySelector('.js-image-index').innerHTML).toBe('1');
        });

        it("should go to a particular image if the URL specifies it", function() {
            bean.fire(document.querySelector('.trail--gallery .link-to-image'), 'click');
            waits(100);
            runs(function() {
                expect(document.querySelector('.js-image-index').innerHTML).toBe('4');
            })
        });

        it("should go to first image if the URL specifies ?index=0", function() {
            document.querySelector('.trail--gallery .link-to-image').setAttribute('href', '/link/to/gallery?index=0');

            bean.fire(document.querySelector('.trail--gallery .link-to-image'), 'click');
            waits(100);
            runs(function() {
                expect(document.querySelector('.js-image-index').innerHTML).toBe('1');
            })
        });

        it("should present error page if the server doesn't respond properly", function() {
            common.$g('.overlay').remove();

            var server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.respondWith([500, { "Content-Type": "text/html"}, "Error"]);

            gallery = new LightboxGallery(config, document.getElementById('lightbox-gallery'));
            gallery.init();

            bean.fire(document.querySelector('.trail--gallery a'), 'click');

            waits(100);

            runs(function() {
                expect(document.querySelector('.overlay .preload-msg').innerHTML).toContain('Error loading gallery');
            });
        });


        it("should register that the gallery has loaded", function() {
            expect(common.mediator.emit).toHaveBeenCalledWith('module:lightbox-gallery:loaded');
        });

        it("should register a pushState on open", function() {
            expect(historyStub).toHaveBeenCalled();
            expect(historyStub.lastCall.args[2]).toContain('index=1');
        });

        it("should register a pushState to current state when opened on a particular image", function() {
            bean.fire(document.querySelector('.trail--gallery .link-to-image'), 'click');
            waits(100);
            runs(function() {
                expect(historyStub).toHaveBeenCalled();
                expect(historyStub.lastCall.args[2]).toContain('index=4');
            })
        });

        it("should have an AJAX url to the gallery without a hostname", function() {
            expect(gallery.galleryEndpoint).not.toContain('://');
        });

        // Slideshow tests
        it("should should show the stop CTA when the slideshow is started", function() {
            expect(document.querySelector('.js-start-slideshow').style.display).not.toBe('none');
            bean.fire(document.querySelector('.js-start-slideshow'), 'click');

            expect(document.querySelector('.js-start-slideshow').style.display).toBe('none');
            expect(document.querySelector('.js-stop-slideshow').style.display).toBe('block');

            bean.fire(document.querySelector('.js-stop-slideshow'), 'click');
        });

        it("should should auto advance to the next image when the slideshow is started", function() {
            expect(document.querySelector('.js-image-index').innerHTML).toBe('1');
            bean.fire(document.querySelector('.js-start-slideshow'), 'click');

            waits(5500);

            runs(function() {
                expect(document.querySelector('.js-image-index').innerHTML).toBe('2');
                bean.fire(document.querySelector('.js-stop-slideshow'), 'click');
            });
        });

        it("should stop the slideshow if there is a user interaction", function() {
            bean.fire(document.querySelector('.js-start-slideshow'), 'click');
            expect(document.querySelector('.gallery').className).toContain('gallery--slideshow');

            bean.fire(document.querySelector('.js-gallery-grid'), 'click');
            expect(document.querySelector('.gallery').className).not.toContain('gallery--slideshow');
            bean.fire(document.querySelector('.js-stop-slideshow'), 'click');
        });


        // Keyboard tests
        it("should navigate the gallery when left/right arrow keys are pressed", function() {
            bean.fire(document.body, 'keydown', { keyCode: 39 });
            expect(document.querySelector('.js-image-index').innerHTML).toBe('2');

            bean.fire(document.body, 'keydown', { keyCode: 39 });
            bean.fire(document.body, 'keydown', { keyCode: 39 });
            expect(document.querySelector('.js-image-index').innerHTML).toBe('4');

            bean.fire(document.body, 'keydown', { keyCode: 37 });
            expect(document.querySelector('.js-image-index').innerHTML).toBe('3');
        });

    });
});
