define(["bean",
        "swipe",
        "common",
        "ajax",
        "bonzo",
        "modules/detect",
        "modules/url",
        "modules/overlay"],
    function (
        bean,
        Swipe,
        common,
        ajax,
        bonzo,
        detect,
        url,
        Overlay) {

    function LightboxGallery(context) {
        var self = this,
            galleryNode,
            currentImage = 1,
            totalImages = 0,
            mode = 'fullimage',
            overlay;

        this.selector = '.trail--gallery';


        this.init = function() {
            bean.on(context, 'click', self.selector + ' a', function(e) {
                e.preventDefault();
                overlay = new Overlay();
                self.bindEvents();
                self.loadGallery(e.currentTarget.href);
            });
        };

        this.bindEvents = function() {
            bean.on(overlay.toolbarNode, 'click', '.js-gallery-grid', this.switchToGrid);
            bean.on(overlay.toolbarNode, 'click', '.js-gallery-full', this.switchToFullImage);
            bean.on(overlay.bodyNode,    'touchstart click', '.js-gallery-prev', this.prev);
            bean.on(overlay.bodyNode,    'touchstart click', '.js-gallery-next', this.next);
            bean.on(overlay.bodyNode,    'click', '.gallery-item', function(el) {
                if (mode == 'grid') {
                    var index = parseInt(el.currentTarget.getAttribute('data-index'), 10);
                    self.goTo(index);
                } else {
                    self.toggleCaption();
                }
            });
            common.mediator.on('modules:overlay:close', function() {
                overlay.remove();
            });
        };

        this.loadGallery = function(url) {
            overlay.show();

            ajax({
                url: url,
                type: 'json',
                method: 'get',
                crossOrigin: true,
                success: function(response) {
                    overlay.setBody(response.html);

                    galleryNode = overlay.bodyNode.querySelector('.gallery--lightbox');
                    totalImages = parseInt(galleryNode.getAttribute('data-total'), 10);

                    self.setupOverlayHeader();
                    self.goTo(currentImage);
                }
            });
        };

        this.setupOverlayHeader = function() {
            var toolbar = '<button class="overlay__cta js-gallery-grid" data-link-name="Gallery grid mode">' +
                          '  <i class="i i-gallery-thumb-icon"></i> ' +
                          '</button>' +
                          '<button class="overlay__cta js-gallery-full" data-link-name="Gallery full image mode">' +
                          '  <i class="i i-gallery-fullimage-icon"></i> ' +
                          '</button>' +
                          '<div class="overlay__cta gallery__counter"><span class="js-image-index gallery__counter--current-image"></span> | '+totalImages+'</div>';

            overlay.toolbarNode.innerHTML = toolbar;
            self.imageIndexNode = overlay.toolbarNode.querySelector('.js-image-index');
            self.gridModeCta    = overlay.headerNode.querySelector('.js-gallery-grid');
            self.fullModeCta    = overlay.headerNode.querySelector('.js-gallery-full');
        };

        this.prev = function(e) {
            e.preventDefault();
            self.goTo(currentImage - 1);
        };

        this.next = function(e) {
            e.preventDefault();
            self.goTo(currentImage + 1);
        };

        this.goTo = function(index) {
            self.switchToFullImage();

            // Protecting against the boundaries
            if (index > totalImages) {
                index = 1;
            } else if (index < 1) {
                index = totalImages;
            }

            Array.prototype.forEach.call(overlay.bodyNode.querySelectorAll('.gallery-item'), function(el) {
                var itemIndex = parseInt(el.getAttribute('data-index'), 10);
                el.style.display = (itemIndex === index) ? 'block' : '';
            });

            currentImage = index;
            self.imageIndexNode.innerText = currentImage;
        };

        this.switchToGrid = function() {
            mode = 'grid';
            bonzo(galleryNode).removeClass('gallery--full').addClass('gallery--grid');

            Array.prototype.forEach.call(overlay.bodyNode.querySelectorAll('.gallery__img'), function(el) {
                el.src = el.getAttribute('data-src');
            });

            // Update CTAs
            self.gridModeCta.style.display = 'none';
            self.fullModeCta.style.display = 'block';
        };

        this.switchToFullImage = function() {
            mode = 'fullimage';
            bonzo(galleryNode).removeClass('gallery--grid').addClass('gallery--full');

            Array.prototype.forEach.call(overlay.bodyNode.querySelectorAll('.gallery__img'), function(el) {
                el.src = el.getAttribute('data-fullsrc');
            });

            // Update CTAs
            self.gridModeCta.style.display = 'block';
            self.fullModeCta.style.display = 'none';
        };

        this.toggleCaption = function() {
            bonzo(galleryNode).toggleClass('gallery--showcaptions');
        };
    }

    return LightboxGallery;
});