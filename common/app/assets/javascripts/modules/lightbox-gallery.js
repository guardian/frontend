define(["bean",
        "common",
        "ajax",
        "bonzo",
        "modules/detect",
        "modules/url",
        "modules/overlay"
        ],
    function (
        bean,
        common,
        ajax,
        bonzo,
        detect,
        url,
        Overlay) {

    function LightboxGallery(config, context) {
        var self = this,
            galleryNode,
            imagesNode,
            currentImage = 1,
            totalImages = 0,
            mode = 'fullimage',
            overlay,
            swipeActive = false,
            $navArrows,
            $images;

        this.selector = '.trail--gallery';
        this.galleryEndpoint = '';

        this.init = function() {
            if (config.switches.lightboxGalleries) {
                bean.on(context, 'click', self.selector + ' a', function(e) {
                    var galleryUrl = e.currentTarget.href;

                    self.galleryEndpoint = galleryUrl.split('?')[0] + '/lightbox.json';

                    // Go to a specific image if it's in the query string. eg: index=3
                    if (galleryUrl.indexOf('index=') !== -1) {
                        var urlParams = url.getUrlVars({
                            query: galleryUrl.split('?')[1]
                        });
                        currentImage = parseInt(urlParams.index, 10);
                    }

                    e.preventDefault();
                    overlay = new Overlay();
                    self.bindEvents();
                    self.loadGallery();
                });
            }
        };

        this.bindEvents = function() {
            bean.on(overlay.toolbarNode, 'touchstart click', '.js-gallery-grid', this.switchToGrid);
            bean.on(overlay.toolbarNode, 'touchstart click', '.js-gallery-full', this.switchToFullImage);
            bean.on(overlay.bodyNode,    'click', '.js-gallery-prev', this.prev);
            bean.on(overlay.bodyNode,    'click', '.js-gallery-next', this.next);
            bean.on(overlay.bodyNode,    'click', '.js-load-gallery', this.loadGallery);
            bean.on(overlay.bodyNode,    'click', '.js-toggle-furniture', this.toggleFurniture);
            bean.on(overlay.bodyNode,    'click', '.gallery--grid-mode .gallery-item', function(el) {
                var index = parseInt(el.currentTarget.getAttribute('data-index'), 10);
                self.goTo(index);
            });

            bean.on(overlay.bodyNode,    'click', '.gallery__img', function() {
                self.toggleFurniture();
            });

            bean.on(window, 'orientationchange', function() {
                self.layout();
                if (self.getOrientation() === 'landscape') {
                    self.jumpToContent();
                }
            });

            bean.on(window, 'resize', common.debounce(function() {
                self.layout();
            }));

            common.mediator.on('modules:overlay:close', this.removeOverlay);

            bean.one(window, 'popstate', function(event) {
                // Slight timeout as browsers reset the scroll position on popstate
                setTimeout(function() {
                    overlay.hide();
                    self.removeOverlay();
                },10);

                common.mediator.emit('module:clickstream:interaction', 'Lightbox Gallery - Back button exit');
            });
        };

        this.loadGallery = function() {
            overlay.showLoading();

            // Save state to preserve back button functionality
            url.pushUrl({ lightbox: true }, document.title, window.location.href);

            ajax({
                url: self.galleryEndpoint,
                type: 'json',
                method: 'get',
                crossOrigin: true,
                success: function(response) {
                    overlay.setBody(response.html);

                    galleryNode  = overlay.bodyNode.querySelector('.gallery--lightbox');
                    $navArrows   = bonzo(galleryNode.querySelectorAll('.gallery__nav'));
                    $images      = bonzo(galleryNode.querySelectorAll('.gallery__img'));
                    totalImages  = parseInt(galleryNode.getAttribute('data-total'), 10);

                    // Keep a copy of the original images markup, so we can
                    // easily restore it back when removing swipe
                    imagesNode   = galleryNode.querySelector('.gallery__images');
                    imagesNode._originalHtml = imagesNode.innerHTML;

                    self.layout();
                    self.setupOverlayHeader();
                    self.goTo(currentImage);

                    // Register this as a page view
                    common.mediator.emit('module:lightbox-gallery:loaded', response.config, galleryNode);
                },
                error: function() {
                    var errorMsg = '<div class="preload-msg">Error loading gallery' +
                                   '  <button class="cta js-load-gallery" data-link-name="Try loading gallery again" data-is-ajax>Try again</button>' +
                                   '</div>';
                    overlay.setBody(errorMsg);
                }
            });
        };

        // Overlay methods
        this.setupOverlayHeader = function() {
            var toolbar = '<button class="overlay__cta js-gallery-grid" data-link-name="Gallery grid mode">' +
                          '  <i class="i i-gallery-thumb-icon"></i> ' +
                          '</button>' +
                          '<button class="overlay__cta js-gallery-full" data-link-name="Gallery full image mode">' +
                          '  <i class="i i-gallery-fullimage-icon"></i> ' +
                          '</button>' +
                          '<div class="overlay__cta gallery__counter">' +
                          '  <span class="js-image-index gallery__counter--current-image"></span> | '+totalImages +
                          '</div>';

            overlay.toolbarNode.innerHTML = toolbar;
            self.imageIndexNode = overlay.toolbarNode.querySelector('.js-image-index');
            self.gridModeCta    = overlay.headerNode.querySelector('.js-gallery-grid');
            self.fullModeCta    = overlay.headerNode.querySelector('.js-gallery-full');
        };

        this.removeOverlay = common.debounce(function(e){
            // Needs a delay to give time for analytics to fire before DOM removal
            overlay.remove();
            return true;
        }, 500);


        // Gallery methods
        this.prev = function(e) {
            if (e) { e.preventDefault(); }
            self.goTo(currentImage - 1);
        };

        this.next = function(e) {
            if (e) { e.preventDefault(); }
            self.goTo(currentImage + 1);
        };

        this.goTo = function(index) {
            // Protecting against the boundaries
            if (index > totalImages) {
                index = 1;
            } else if (index < 1) {
                index = totalImages;
            }

            Array.prototype.forEach.call(overlay.bodyNode.querySelectorAll('.gallery-item'), function(el) {
                var itemIndex = parseInt(el.getAttribute('data-index'), 10),
                    captionControlHeight = 35; // If the caption CTA is hidden, we can't read the height; so hardcoded it goes

                if (itemIndex === index) {
                    el.style.display = 'inline-block';

                    // Match arrows to the height of image, minus height of the caption control to prevent overlap
                    $navArrows.css('height', ($images[index-1].offsetHeight - captionControlHeight) + 'px');
                } else {
                    el.style.display = ''; // Not set to 'none' so that it doesn't hide them from the Grid view
                }
            });

            currentImage = index;
            self.imageIndexNode.innerHTML = currentImage;
            self.switchToFullImage();
            //self.jumpToContent();
        };

        this.switchToGrid = function(e) {
            mode = 'grid';

            if (swipeActive) {
                self.removeSwipe();
            }

            bonzo(galleryNode).removeClass('gallery--fullimage-mode').addClass('gallery--grid-mode');

            Array.prototype.forEach.call(overlay.bodyNode.querySelectorAll('.gallery__img'), function(el) {
                el.src = el.getAttribute('data-src');
            });

            // Update CTAs
            self.gridModeCta.style.display = 'none';
            self.fullModeCta.style.display = 'block';

            self.layout();

            if (e) { e.preventDefault(); }
        };

        this.switchToFullImage = function(e) {
            mode = 'fullimage';

            if (detect.hasTouchScreen()) {
                self.setupSwipe();
            }

            bonzo(galleryNode).removeClass('gallery--grid-mode').addClass('gallery--fullimage-mode');

            Array.prototype.forEach.call(overlay.bodyNode.querySelectorAll('.gallery__img'), function(el, i) {
                // Switch the current and next image to high quality src
                if (i === (currentImage - 1) || i === (currentImage)) {
                    el.src = el.getAttribute('data-fullsrc');
                }
            });

            // Update CTAs
            self.gridModeCta.style.display = 'block';
            self.fullModeCta.style.display = 'none';

            if (e) { e.preventDefault(); }
        };

        this.toggleFurniture = function() {
            bonzo(galleryNode).toggleClass('gallery--hide-furniture');
        };

        this.layout = function() {
            var orientation = self.getOrientation();

            // Make overlay large enough to allow the browser chrome to be hidden
            overlay.node.style.minHeight = window.innerHeight + overlay.headerNode.offsetHeight + 'px';

            if (orientation === 'landscape' && mode === 'fullimage') {
                // In landscape, size all images to the height of the screen
                $images.css({'height': window.innerHeight + 'px', 'width': 'auto'});
            } else {
                $images.removeAttr('style');
            }
        };

        // Utils
        this.getOrientation = function() {
            return (window.innerHeight > window.innerWidth) ? 'portrait' : 'landscape';
        };

        this.jumpToContent = function() {
            window.scrollTo(0, overlay.headerNode.offsetHeight);
        };


        // Swipe methods
        this.setupSwipe = function() {
            require(['js!swipe'], function() {
                // set up the swipe actions
                galleryNode.className += ' gallery--swipe';

                self.swipe = new Swipe(galleryNode, {
                    startSlide: currentImage - 1,
                    speed: 200,
                    continuous: false,
                    callback: function(index, elm) {
                        self.imageIndexNode.innerHTML = index + 1;
                    }
                });

                swipeActive = true;
            });
        };

        this.removeSwipe = function() {
            self.swipe.kill();
            bonzo(imagesNode).removeAttr('style')
                             .html(imagesNode._originalHtml);

            bonzo(galleryNode).removeClass('gallery--swipe');

            swipeActive = false;
        };
    }

    return LightboxGallery;
});