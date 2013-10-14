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
            pageUrl = '/' + config.page.pageId, // The page url we're starting from
            galleryNode,
            imagesNode,
            currentImage = 1,
            totalImages = 0,
            mode = 'fullimage',
            overlay,
            swipeActive,
            isSwiping,
            slideshowActive,
            slideshowDelay = 5000, // in milliseconds
            captionControlHeight = 35, // If the caption CTA is hidden, we can't read the height; so hardcoded it goes
            pushUrlChanges = true,
            originalImagesHtml, // Used to keep a copy of the markup, before Swipe rewrites it
            $navArrows,
            $images;

        this.selector = '.gallerythumbs';
        this.galleryEndpoint = ''; // Hook for tests

        this.init = function(opts) {
            self.opts = opts || {};

            if (config.switches.lightboxGalleries || self.opts.overrideSwitch) {
                // Apply tracking to links
                bonzo(context.querySelectorAll(self.selector + ' a')).attr('data-is-ajax', '1');

                bean.on(context, 'click', self.selector + ' a', function(e) {
                    e.preventDefault();
                    var galleryUrl = e.currentTarget.getAttribute('href');

                    // Go to a specific image if it's in the query string. eg: index=3
                    if (galleryUrl.indexOf('index=') !== -1) {
                        var urlParams = url.getUrlVars({
                            query: galleryUrl.split('?')[1]
                        });
                        currentImage = parseInt(urlParams.index, 10);
                    }


                    self.loadGallery({
                        url: galleryUrl
                    });
                });

                // Disable URL changes when the app-wide swipe is on
                if(document.body.className.indexOf('has-swipe') !== -1) {
                    pushUrlChanges = false;
                }

                // Load gallery straight away if url contains a direct image link
                var urlParams = url.getUrlVars();
                if (urlParams.index) {
                    this.loadGallery({
                        url: '/' + config.page.pageId,
                        startingImage: parseInt(urlParams.index, 10)
                    });
                }
            }
        };

        this.bindEvents = function() {
            bean.on(overlay.toolbarNode, 'touchstart click', '.js-gallery-grid', this.switchToGrid);
            bean.on(overlay.toolbarNode, 'touchstart click', '.js-gallery-full', this.switchToFullImage);
            bean.on(overlay.toolbarNode, 'click', '.js-start-slideshow', this.startSlideshow);
            bean.on(overlay.toolbarNode, 'click', '.js-stop-slideshow', this.stopSlideshow);
            bean.on(overlay.bodyNode,    'click', '.js-gallery-prev', this.prev);
            bean.on(overlay.bodyNode,    'click', '.js-gallery-next', this.next);
            bean.on(overlay.bodyNode,    'click', '.js-load-gallery', this.loadGallery);
            bean.on(overlay.bodyNode,    'click', '.js-toggle-furniture', this.toggleFurniture);

            bean.on(overlay.bodyNode,    'click', '.gallery--fullimage-mode .gallery__img', function(e) {
                if (swipeActive && !isSwiping) {
                    self.swipe.next();
                }
            });

            bean.on(overlay.bodyNode,    'touchmove', '.gallery__img', function() {
                isSwiping = true;
            });

            bean.on(overlay.bodyNode,    'touchend', '.gallery__img', function() {
                // This prevents a click event firing at the same time as swipe is finishing
                setTimeout(function() {
                    isSwiping = false;
                }, 250);
            });

            bean.on(overlay.bodyNode,    'click', '.gallery--grid-mode .gallery__item', function(el) {
                var index = parseInt(el.currentTarget.getAttribute('data-index'), 10);
                self.goTo(index);
            });

            bean.on(window, 'orientationchange', function() {
                self.layout();
                if (detect.getOrientation() === 'landscape') {
                    self.jumpToContent();
                }
            });

            bean.on(window, 'resize', common.debounce(function() {
                self.layout();
            }));

            common.mediator.on('modules:overlay:close', function() {
                self.removeOverlay();

                self.stopSlideshow();

                // Remove keyboard handlers
                bean.off(document.body, 'keydown', self.handleKeyEvents);

                // Go back to the URL that we started on
                if (pushUrlChanges) {
                    url.pushUrl({}, document.title, pageUrl, true);
                }
            });

            bean.on(window, 'popstate', function(event) {
                if (event.state && event.state.lightbox && event.state.currentImage) {
                    self.goTo(event.state.currentImage, {
                        dontUpdateUrl: true
                    });

                } else if (event.state && event.state.lightbox && !event.state.currentImage) {
                    // This happens when we reach back to the state before the lightbox was opened
                    // Needs a slight timeout as browsers reset the scroll position on popstate
                    setTimeout(function() {
                        overlay.hide();
                        self.removeOverlay();
                    },10);

                    // Remove keyboard handlers
                    bean.off(document.body, 'keydown', self.handleKeyEvents);

                    common.mediator.emit('module:clickstream:interaction', 'Lightbox Gallery - Back button exit');
                }
            });
        };

        this.handleKeyEvents = function(e) {
            if (e.keyCode === 37) { // left
                self.prev();
                self.trackInteraction('keyboard:previous');
            } else if (e.keyCode === 39) { // right
                self.next();
                self.trackInteraction('keyboard:next');
            } else if (e.keyCode === 27) { // esc
                overlay.hide();
            }
        };

        this.loadGallery = function(opts) {
            swipeActive = false;
            overlay = new Overlay();
            overlay.showLoading();

            this.galleryEndpoint = opts.url.split('?')[0] + '/lightbox.json';
            this.bindEvents();

            if (opts.startingImage) {
                currentImage = opts.startingImage;
            }

            ajax({
                url: self.galleryEndpoint,
                type: 'json',
                method: 'get',
                crossOrigin: true,
                success: function(response) {
                    self.galleryUrl = '/' + response.config.page.pageId;

                    overlay.setBody(response.html);

                    galleryNode  = overlay.bodyNode.querySelector('.gallery--lightbox');
                    $navArrows   = bonzo(galleryNode.querySelectorAll('.gallery__nav'));
                    $images      = bonzo(galleryNode.querySelectorAll('.gallery__img'));
                    totalImages  = parseInt(galleryNode.getAttribute('data-total'), 10);

                    // Save the first state of the gallery
                    // This allows us to close the overlay if we go back far enough in the history
                    url.pushUrl({ lightbox: true }, document.title, self.galleryUrl);

                    // Keep a copy of the original images markup, so we can
                    // easily restore it back when removing swipe
                    imagesNode = galleryNode.querySelector('.gallery__images');
                    originalImagesHtml = imagesNode.innerHTML;

                    // If currentimage is out of bounds, start from the beginning
                    // Protects against ?index=0
                    if (!currentImage || currentImage > totalImages) { currentImage = 1; }

                    self.layout();
                    self.setupOverlayHeader();
                    self.goTo(currentImage);

                    // Setup keyboard nav handler
                    bean.on(document.body, 'keydown', self.handleKeyEvents);

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
                          '<button class="overlay__cta js-start-slideshow" data-link-name="Gallery start slideshow">' +
                          '  <i class="i i-gallery-play-slideshow"></i> ' +
                          '</button>' +
                          '<button class="overlay__cta js-stop-slideshow" data-link-name="Gallery stop slideshow">' +
                          '  <i class="i i-gallery-pause-slideshow"></i> ' +
                          '</button>' +
                          '<div class="overlay__cta gallery__counter">' +
                          '  <span class="js-image-index gallery__counter--current-image"></span> | '+totalImages +
                          '</div>';

            overlay.toolbarNode.innerHTML = toolbar;
            self.imageIndexNode = overlay.toolbarNode.querySelector('.js-image-index');
            self.gridModeCta    = overlay.headerNode.querySelector('.js-gallery-grid');
            self.fullModeCta    = overlay.headerNode.querySelector('.js-gallery-full');

            overlay.toolbarNode.querySelector('.js-stop-slideshow').style.display  = 'none';
        };

        this.removeOverlay = common.debounce(function(e){
            // Needs a delay to give time for analytics to fire before DOM removal
            overlay.remove();
            return true;
        }, 500);


        // Gallery methods
        this.prev = function(e) {
            if (e) { e.preventDefault(); }

            self.stopSlideshow();

            if (swipeActive) {
                self.swipe.prev();
            } else {
                self.goTo(currentImage - 1);
            }
        };

        this.next = function(e) {
            if (e) { e.preventDefault(); }

            self.stopSlideshow();

            if (swipeActive) {
                self.swipe.next();
            } else {
                self.goTo(currentImage + 1);
            }
        };

        this.goTo = function(index, opts) {
            opts = opts || {};

            // Protecting against the boundaries
            if (index > totalImages) {
                index = 1;
            } else if (index < 1) {
                index = totalImages;
            }

            Array.prototype.forEach.call(overlay.bodyNode.querySelectorAll('.gallery__item'), function(el) {
                var itemIndex = parseInt(el.getAttribute('data-index'), 10);

                if (itemIndex === index) {
                    bonzo(el).addClass('gallery__item--active');

                    self.alignNavArrows();

                    self.currentImageNode = el;
                } else {
                    bonzo(el).removeClass('gallery__item--active');
                }
            });

            currentImage = index;
            self.imageIndexNode.innerHTML = currentImage;
            self.switchToFullImage();


            if (!opts.dontUpdateUrl) {
                self.pushUrlState();
            }
        };

        this.switchToGrid = function(e) {
            mode = 'grid';

            if (slideshowActive) {
                self.stopSlideshow();
            }

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

            if (detect.hasTouchScreen() &&
                !swipeActive &&
                !self.opts.disableSwipe &&
                !slideshowActive) {
                    self.setupSwipe();
            }


            bonzo(galleryNode).removeClass('gallery--grid-mode').addClass('gallery--fullimage-mode');

            self.preloadImages();

            // Update CTAs
            self.gridModeCta.style.display = 'block';
            self.fullModeCta.style.display = 'none';

            self.layout();

            if (e) { e.preventDefault(); }
        };

        this.preloadImages = function() {
            Array.prototype.forEach.call($images, function(el, i) {
                // Switch the current and next image to high quality src
                if (i === (currentImage - 1) || i === (currentImage)) {
                    el.src = el.getAttribute('data-fullsrc');
                }
            });
        };

        this.toggleFurniture = function() {
            bonzo(galleryNode).toggleClass('gallery--hide-furniture');
        };

        this.layout = function() {
            var orientation = detect.getOrientation(),
                contentHeight = window.innerHeight - overlay.headerNode.offsetHeight;

            // We query for the images here, as the swipe lib can rewrite the DOM, which loses the references
            $images = bonzo(galleryNode.querySelectorAll('.gallery__img'));

            if (orientation === 'landscape' && mode === 'fullimage') {
                // In landscape, size all images to the height of the screen
                $images.css({'height': contentHeight + 'px', 'width': 'auto'});
            } else if (mode === 'fullimage') {
                $images.css({'height': 'auto', 'width': '100%'});
            }

            self.alignNavArrows();
        };

        this.jumpToContent = function() {
            window.scrollTo(0, overlay.headerNode.offsetHeight);
        };

        this.alignNavArrows = function() {
            // Match arrows to the height of image, minus height of the caption control to prevent overlap
            $navArrows.css('height', ($images[currentImage-1].offsetHeight - captionControlHeight) + 'px');
        };


        // Swipe methods
        this.setupSwipe = function() {
            require(['js!swipe'], function() {
                // set up the swipe actions
                bonzo(galleryNode).addClass('gallery--swipe');

                self.swipe = new Swipe(galleryNode, {
                    startSlide: currentImage - 1,
                    speed: 200,
                    continuous: true,
                    callback: function(index, elm) {
                        var swipeDir = (index + 1 > currentImage) ? 'next' : 'prev';
                        self.trackInteraction('Lightbox gallery swipe - ' + swipeDir);

                        currentImage = index + 1;
                        self.imageIndexNode.innerHTML = currentImage;

                        // set the height of the gallery to the height of the current image
                        // preventing a large scrollable space to appear underneath the image
                        if (swipeActive) {
                            galleryNode.style.height = galleryNode.querySelector('.js-gallery-item-'+currentImage).offsetHeight + 'px';
                        }

                        self.alignNavArrows();

                        self.preloadImages();

                        self.pushUrlState();
                    }
                });

                self.alignNavArrows();
                swipeActive = true;
            });
        };

        this.removeSwipe = function() {
            self.swipe.kill();
            bonzo(imagesNode).removeAttr('style')
                             .html(originalImagesHtml);

            bonzo(galleryNode).removeClass('gallery--swipe')
                              .css('height', 'auto');

            swipeActive = false;
        };


        this.pushUrlState = function(opts) {
            opts = opts || {};
            if (pushUrlChanges) {
                var state = {
                    lightbox: true,
                    currentImage: currentImage
                };

                url.pushUrl(state, document.title, self.galleryUrl + '?index=' + currentImage, opts.replace);
            }
        };


        // send custom (eg non-link) interactions to omniture
        this.trackInteraction = function (str) {
            common.mediator.emit('module:clickstream:interaction', str);
        };



        // Slideshow methods
        this.startSlideshow = function() {
            slideshowActive = true;

            bonzo(galleryNode).addClass('gallery--slideshow');

            overlay.toolbarNode.querySelector('.js-start-slideshow').style.display = 'none';
            overlay.toolbarNode.querySelector('.js-stop-slideshow').style.display  = 'block';

            if (swipeActive) {
                self.removeSwipe();
                self.goTo(currentImage);
            }

            self.slideshowTimer = setInterval(function() {
                self.goTo(currentImage+1);
            }, slideshowDelay);
        };

        this.stopSlideshow = function() {
            if (slideshowActive) {
                slideshowActive = false;

                bonzo(galleryNode).removeClass('gallery--slideshow');

                overlay.toolbarNode.querySelector('.js-start-slideshow').style.display = 'block';
                overlay.toolbarNode.querySelector('.js-stop-slideshow').style.display  = 'none';

                clearInterval(self.slideshowTimer);
                self.goTo(currentImage);
            }
        };
    }

    return LightboxGallery;
});
