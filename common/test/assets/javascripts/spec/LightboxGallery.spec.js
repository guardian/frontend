define(['common',
        'ajax',
        'modules/lightbox-gallery',
        'bean',
        'fixtures',
        '../fixtures/lightbox-gallery'],
    function(common,
             ajax,
             LightboxGallery,
             bean,
             fixtures,
             galleryResponse) {

    describe("Lightbox Gallery", function() {

        var $ = common.$g,
            gallery,
            conf = {
                id: 'lightbox-gallery',
                fixtures: [
                    '<li class="trail trail--gallery">' +
                    '  <a href="/link/to/gallery" class="">Trail to gallery</a>' +
                    '  <a href="/link/to/gallery?index=4" class="link-to-image">Trail to specific gallery image</a>' +
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
            switches: {
                lightboxGalleries: true
            }
        };

        // setup fake server
        var server = sinon.fakeServer.create();
        server.autoRespond = true;
        server.respondWith(galleryResponse);

        beforeEach(function() {
            fixtures.render(conf);

            common.$g('.overlay').remove();
            gallery = new LightboxGallery(config, document.getElementById('lightbox-gallery'));
            gallery.init();

            bean.fire(document.querySelector('.trail--gallery a'), 'click');
            waits(100);
        });


        it("should create a gallery within an overlay", function() {
            expect(document.querySelectorAll('.overlay .gallery').length).toBe(1);
        });

        it("should start in single image mode", function() {
            expect(document.querySelector('.gallery').className).toContain('gallery--full');

            var visibleImages = 0;
            common.$g('.gallery-item').each(function(e) {
                if (e.style.display === 'block') {
                    visibleImages += 1;
                }
            });

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
            expect(document.querySelector('.gallery .js-gallery-item-5').style.display).toBe('block');
            expect(document.querySelector('.js-image-index').innerHTML).toBe('5');
        });

        it("should hide/show the furniture when clicking the image", function() {
            bean.fire(document.querySelector('.gallery-item'), 'click');
            expect(document.querySelector('.gallery').className).toContain('gallery--hide-furniture');
            bean.fire(document.querySelector('.gallery-item'), 'click');
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

    });
});
