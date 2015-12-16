define([
    'bean',
    'bonzo',
    'qwery',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/fsm',
    'common/utils/mediator',
    'common/utils/template',
    'common/utils/url',
    'common/modules/component',
    'common/modules/ui/blockSharing',
    'common/modules/ui/images',
    'common/views/svgs',
    'text!common/views/content/block-sharing.html',
    'text!common/views/content/button.html',
    'text!common/views/content/endslate.html',
    'text!common/views/content/loader.html',
    'text!common/views/content/share-button.html',
    'text!common/views/content/share-button-mobile.html',
    'lodash/collections/map',
    'lodash/functions/throttle',
    'lodash/collections/forEach',
    'common/utils/chain'
], function (
    bean,
    bonzo,
    qwery,
    $,
    ajax,
    config,
    detect,
    FiniteStateMachine,
    mediator,
    template,
    url,
    Component,
    blockSharing,
    imagesModule,
    svgs,
    blockSharingTpl,
    buttonTpl,
    endslateTpl,
    loaderTpl,
    shareButtonTpl,
    shareButtonMobileTpl,
    map,
    throttle,
    forEach,
    chain) {

    function GalleryLightbox() {

        // CONFIG
        this.showEndslate = detect.getBreakpoint() !== 'mobile' && config.page.section !== 'childrens-books-site' && config.page.contentType === 'Gallery';
        this.useSwipe = detect.hasTouchScreen();
        this.swipeThreshold = 0.05;

        // TEMPLATE
        function generateButtonHTML(label) {
            var tmpl = buttonTpl;
            return template(tmpl, {label: label});
        }

        this.galleryLightboxHtml =
            '<div class="overlay gallery-lightbox gallery-lightbox--closed gallery-lightbox--hover">' +
            '<div class="gallery-lightbox__sidebar">' +
            generateButtonHTML('close') +
            '<div class="gallery-lightbox__progress  gallery-lightbox__progress--sidebar">' +
            '<span class="gallery-lightbox__index js-gallery-index"></span>' +
            '<span class="gallery-lightbox__progress-separator"></span>' +
            '<span class="gallery-lightbox__count js-gallery-count"></span>' +
            '</div>' +
            generateButtonHTML('next') +
            generateButtonHTML('prev') +
            generateButtonHTML('info-button') +
            '</div>' +

            '<div class="js-gallery-swipe gallery-lightbox__swipe-container">' +
            '<ul class="gallery-lightbox__content js-gallery-content">' +
            '</ul>' +
            '</div>' +

            '</div>';

        // ELEMENT BINDINGS
        this.lightboxEl = bonzo.create(this.galleryLightboxHtml);
        this.$lightboxEl = bonzo(this.lightboxEl).prependTo(document.body);
        this.$indexEl = $('.js-gallery-index', this.lightboxEl);
        this.$countEl = $('.js-gallery-count', this.lightboxEl);
        this.$contentEl = $('.js-gallery-content', this.lightboxEl);
        this.nextBtn = qwery('.js-gallery-next', this.lightboxEl)[0];
        this.prevBtn = qwery('.js-gallery-prev', this.lightboxEl)[0];
        this.closeBtn = qwery('.js-gallery-close', this.lightboxEl)[0];
        this.infoBtn = qwery('.js-gallery-info-button', this.lightboxEl)[0];
        this.$swipeContainer = $('.js-gallery-swipe');
        bean.on(this.nextBtn, 'click', this.trigger.bind(this, 'next'));
        bean.on(this.prevBtn, 'click', this.trigger.bind(this, 'prev'));
        bean.on(this.closeBtn, 'click', this.close.bind(this));
        bean.on(this.infoBtn, 'click', this.trigger.bind(this, 'toggle-info'));
        this.handleKeyEvents = this.handleKeyEvents.bind(this); // bound for event handler
        this.resize = this.trigger.bind(this, 'resize');
        this.toggleInfo = function (e) {
            var infoPanelClick =
                bonzo(e.target).hasClass('js-gallery-lightbox-info') ||
                $.ancestor(e.target, 'js-gallery-lightbox-info');
            if (!infoPanelClick) {
                this.trigger('toggle-info');
            }
        }.bind(this);

        if (detect.hasTouchScreen()) {
            this.disableHover();
        }

        bean.on(window, 'popstate', function (event) {
            if (!event.state) {
                this.trigger('close');
            }
        }.bind(this));

        // FSM CONFIG
        this.fsm = new FiniteStateMachine({
            initial: 'closed',
            onChangeState: function (oldState, newState) {
                this.$lightboxEl
                    .removeClass('gallery-lightbox--' + oldState)
                    .addClass('gallery-lightbox--' + newState);
            },
            context: this,
            states: this.states
        });
    }

    GalleryLightbox.prototype.generateImgHTML = function (img, i) {
        var blockShortUrl = config.page.shortUrl,
            urlPrefix = img.src.indexOf('//') === 0 ? 'http:' : '',
            shareItems = [{
                'text': 'Facebook',
                'css': 'facebook',
                'icon': svgs('shareFacebook', ['icon']),
                'url': 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(blockShortUrl + '/sfb#img-' + i)
            }, {
                'text': 'Twitter',
                'css': 'twitter',
                'icon': svgs('shareTwitter', ['icon']),
                'url': 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(config.page.webTitle) + '&url=' + encodeURIComponent(blockShortUrl + '/stw#img-' + i)
            }, {
                'text': 'Pinterest',
                'css': 'pinterest',
                'icon': svgs('sharePinterest', ['icon']),
                'url': encodeURI('http://www.pinterest.com/pin/create/button/?description=' + config.page.webTitle + '&url=' + blockShortUrl + '&media=' + urlPrefix + img.src)
            }];

        return template(blockSharingTpl.replace(/^\s+|\s+$/gm, ''), {
            articleType: 'gallery',
            count: this.images.length,
            index: i,
            caption: img.caption,
            credit: img.displayCredit ? img.credit : '',
            blockShortUrl: blockShortUrl,
            shareButtons: map(shareItems, template.bind(null, shareButtonTpl)).join(''),
            shareButtonsMobile: map(shareItems, template.bind(null, shareButtonMobileTpl)).join('')
        });
    };

    GalleryLightbox.prototype.initSwipe = function () {

        var threshold, ox, dx, touchMove,
            updateTime = 20; // time in ms

        bean.on(this.$swipeContainer[0], 'touchstart', function (e) {
            threshold = this.swipeContainerWidth * this.swipeThreshold;
            ox = e.touches[0].pageX;
            dx = 0;
        }.bind(this));

        touchMove = function (e) {
            e.preventDefault();
            if (e.touches.length > 1 || e.scale && e.scale !== 1) {
                return;
            }
            dx = e.touches[0].pageX - ox;
            this.translateContent(this.index, dx, updateTime);
        }.bind(this);

        bean.on(this.$swipeContainer[0], 'touchmove', throttle(touchMove, updateTime, {trailing: false}));

        bean.on(this.$swipeContainer[0], 'touchend', function () {
            var direction;
            if (Math.abs(dx) > threshold) {
                direction = dx > threshold ? 1 : -1;
            } else {
                direction = 0;
            }
            dx = 0;

            if (direction === 1) {
                if (this.index > 1) {
                    this.trigger('prev');
                } else {
                    this.trigger('reload');
                }
            } else if (direction === -1) {
                if (this.index < this.$slides.length) {
                    this.trigger('next');
                } else {
                    this.trigger('reload');
                }
            } else {
                this.trigger('reload');
            }

        }.bind(this));
    };

    GalleryLightbox.prototype.disableHover = function () {
        this.$lightboxEl.removeClass('gallery-lightbox--hover');
    };

    GalleryLightbox.prototype.trigger = function (event, data) {
        this.fsm.trigger(event, data);
    };

    GalleryLightbox.prototype.loadGalleryfromJson = function (galleryJson, startIndex) {
        this.index = startIndex;
        if (this.galleryJson && galleryJson.id === this.galleryJson.id) {
            this.trigger('open');
        } else {
            this.trigger('loadJson', galleryJson);
        }
    };

    GalleryLightbox.prototype.loadSurroundingImages = function (index, count) {

        var imageContent, $img;
        chain([-1, 0, 1]).and(
            map,
            function (i) { return index + i === 0 ? count - 1 : (index - 1 + i) % count; }
        ).and(forEach, function (i) {
                imageContent = this.images[i];
                $img = bonzo(this.$images[i]);
                if (!$img.attr('src')) {
                    $img.parent()
                        .append(bonzo.create(loaderTpl));

                    $img.attr('src', imageContent.src);
                    $img.attr('srcset', imageContent.srcsets);
                    $img.attr('sizes', imageContent.sizes);

                    bean.one($img[0], 'load', function () {
                        $('.js-loader').remove();
                    });

                }
            }.bind(this));

    };

    GalleryLightbox.prototype.translateContent = function (imgIndex, offset, duration) {
        var px = -1 * (imgIndex - 1) * this.swipeContainerWidth,
            contentEl = this.$contentEl[0];
        contentEl.style.webkitTransitionDuration = duration + 'ms';
        contentEl.style.mozTransitionDuration = duration + 'ms';
        contentEl.style.msTransitionDuration = duration + 'ms';
        contentEl.style.transitionDuration = duration + 'ms';
        contentEl.style.webkitTransform = 'translate(' + (px + offset) + 'px,0)' + 'translateZ(0)';
        contentEl.style.mozTransform = 'translate(' + (px + offset) + 'px,0)';
        contentEl.style.msTransform = 'translate(' + (px + offset) + 'px,0)';
        contentEl.style.transform = 'translate(' + (px + offset) + 'px,0)' + 'translateZ(0)';
    };

    GalleryLightbox.prototype.states = {

        'closed': {
            enter: function () {
                this.hide();
            },
            leave: function () {
                this.show();
                url.pushUrl({}, document.title, '/' + this.galleryJson.id);
            },
            events: {
                'open': function () {
                    if (this.swipe) {
                        this.swipe.slide(this.index, 0);
                    }
                    this.state = 'image';
                },
                'loadJson': function (json) {
                    this.galleryJson = json;
                    this.images = json.images;
                    this.$countEl.text(this.images.length);

                    var imagesHtml = chain(this.images).and(
                        map,
                        function (img, i) { return this.generateImgHTML(img, i + 1); }.bind(this)
                    ).join('').value();

                    this.$contentEl.html(imagesHtml);

                    this.$images = $('.js-gallery-lightbox-img', this.$contentEl[0]);

                    if (this.showEndslate) {
                        this.loadEndslate();
                    }

                    this.$slides = $('.js-gallery-slide', this.$contentEl[0]);

                    if (this.useSwipe) {
                        this.initSwipe();
                    }

                    if (this.galleryJson.images.length < 2) {
                        bonzo([this.nextBtn, this.prevBtn]).hide();
                        $('.gallery-lightbox__progress', this.lightboxEl).hide();
                    }

                    this.state = 'image';
                }
            }
        },

        'image': {
            enter: function () {

                this.swipeContainerWidth = this.$swipeContainer.dim().width;

                // load prev/current/next
                this.loadSurroundingImages(this.index, this.images.length);

                this.translateContent(this.index, 0, (this.useSwipe && detect.isBreakpoint({max: 'tablet'}) ? 100 : 0));

                url.pushUrl({}, document.title, '/' + this.galleryJson.id + '#img-' + this.index, true);

                // event bindings
                bean.on(this.$swipeContainer[0], 'click', '.js-gallery-content', this.toggleInfo);
                mediator.on('window:resize', this.resize);

                // meta
                this.$indexEl.text(this.index);

                imagesModule.upgradePictures();
            },
            leave: function () {
                bean.off(this.$swipeContainer[0], 'click', this.toggleInfo);
                mediator.off('window:resize', this.resize);
            },
            events: {
                'next': function () {
                    this.pulseButton(this.nextBtn);
                    if (this.index === this.images.length) { // last img
                        if (this.showEndslate) {
                            this.state = 'endslate';
                        } else {
                            this.index = 1;
                            this.reloadState = true;
                        }
                    } else {
                        this.index += 1;
                        this.reloadState = true;
                    }
                },
                'prev': function () {
                    this.pulseButton(this.prevBtn);
                    if (this.index === 1) { // first img
                        if (this.showEndslate) {
                            this.state = 'endslate';
                        } else {
                            this.index = this.images.length;
                            this.reloadState = true;
                        }
                    } else {
                        this.index -= 1;
                        this.reloadState = true;
                    }
                },
                'reload': function () {
                    this.reloadState = true;
                },
                'toggle-info': function () {
                    this.pulseButton(this.infoBtn);
                    this.$lightboxEl.toggleClass('gallery-lightbox--show-info');
                },
                'hide-info': function () {
                    this.pulseButton(this.infoBtn);
                    this.$lightboxEl.removeClass('gallery-lightbox--show-info');
                },
                'show-info': function () {
                    this.pulseButton(this.infoBtn);
                    this.$lightboxEl.addClass('gallery-lightbox--show-info');
                },
                'resize': function () {
                    this.swipeContainerWidth = this.$swipeContainer.dim().width;
                    this.loadSurroundingImages(this.index, this.images.length); // regenerate src
                    this.translateContent(this.index, 0, 0);
                },
                'close': function () { this.state = 'closed'; }
            }
        },

        'endslate': {
            enter: function () {
                this.translateContent(this.$slides.length, 0, 0);
                this.index = this.images.length + 1;
                mediator.on('window:resize', this.resize);
            },
            leave: function () {
                mediator.off('window:resize', this.resize);
            },
            events: {
                'next': function () {
                    this.pulseButton(this.nextBtn);
                    this.index = 1;
                    this.state = 'image';
                },
                'prev': function () {
                    this.pulseButton(this.prevBtn);
                    this.index = this.images.length;
                    this.state = 'image';
                },
                'reload': function () {
                    this.reloadState = true;
                },
                'resize': function () {
                    this.swipeContainerWidth = this.$swipeContainer.dim().width;
                    this.translateContent(this.$slides.length, 0, 0);
                },
                'close': function () { this.state = 'closed'; }
            }
        }
    };

    GalleryLightbox.prototype.show = function () {
        var $body = bonzo(document.body);
        this.bodyScrollPosition = $body.scrollTop();
        $body.addClass('has-overlay');
        this.$lightboxEl.addClass('gallery-lightbox--open');
        bean.off(document.body, 'keydown', this.handleKeyEvents); // prevent double binding
        bean.on(document.body, 'keydown', this.handleKeyEvents);
    };

    GalleryLightbox.prototype.close = function () {
        if (url.hasHistorySupport) {
            url.back();
        } else {
            this.trigger('close');
        }
        this.trigger('close');
    };

    GalleryLightbox.prototype.hide = function () {
        // remove has-overlay first to show body behind lightbox then scroll and
        // close the lightbox at the same time. this way we get no scroll flicker
        var $body = bonzo(document.body);
        $body.removeClass('has-overlay');
        bean.off(document.body, 'keydown', this.handleKeyEvents);
        window.setTimeout(function () {
            if (this.bodyScrollPosition) {
                $body.scrollTop(this.bodyScrollPosition);
            }
            this.$lightboxEl.removeClass('gallery-lightbox--open');
            imagesModule.upgradePictures();
            mediator.emit('ui:images:vh');
        }.bind(this), 1);
    };

    GalleryLightbox.prototype.pulseButton = function (button) {
        var $btn = bonzo(button);
        $btn.addClass('gallery-lightbox__button-pulse');
        window.setTimeout(function () { $btn.removeClass('gallery-lightbox__button-pulse'); }, 75);
    };

    GalleryLightbox.prototype.handleKeyEvents = function (e) {
        if (e.keyCode === 37) { // left
            this.trigger('prev');
        } else if (e.keyCode === 39) { // right
            this.trigger('next');
        } else if (e.keyCode === 38) { // up
            this.trigger('show-info');
        } else if (e.keyCode === 40) { // down
            this.trigger('hide-info');
        } else if (e.keyCode === 27) { // esc
            this.close();
        } else if (e.keyCode === 73) { // 'i'
            this.trigger('toggle-info');
        }
    };

    GalleryLightbox.prototype.endslate = new Component();

    GalleryLightbox.prototype.loadEndslate = function () {
        if (!this.endslate.rendered) {
            this.endslateEl = bonzo.create(endslateTpl);
            this.$contentEl.append(this.endslateEl);

            this.endslate.componentClass = 'gallery-lightbox__endslate';
            this.endslate.endpoint = '/gallery/most-viewed.json';
            this.endslate.ready = function () {
                mediator.emit('page:new-content');
            };
            this.endslate.prerender = function () {
                bonzo(this.elem).addClass(this.componentClass);
            };
            this.endslate.fetch(qwery('.js-gallery-endslate', this.endslateEl), 'html');
        }
    };

    function bootstrap() {
        if ('lightboxImages' in config.page && config.page.lightboxImages.images.length > 0) {
            var lightbox,
                galleryId,
                match,
                galleryHash = window.location.hash,
                images = config.page.lightboxImages,
                res;

            bean.on(document.body, 'click', '.js-gallerythumbs', function (e) {
                e.preventDefault();

                var $el = bonzo(e.currentTarget),
                    galleryHref = $el.attr('href') || $el.attr('data-gallery-url'),
                    galleryHrefParts = galleryHref.split('#img-'),
                    parsedGalleryIndex = parseInt(galleryHrefParts[1], 10),
                    galleryIndex = isNaN(parsedGalleryIndex) ? 1 : parsedGalleryIndex;// 1-based index
                lightbox = lightbox || new GalleryLightbox();

                lightbox.loadGalleryfromJson(images, galleryIndex);
            });

            lightbox = lightbox || new GalleryLightbox();
            galleryId = '/' + config.page.pageId;
            match = /\?index=(\d+)/.exec(document.location.href);
            if (match) { // index specified so launch lightbox at that index
                url.pushUrl(null, document.title, galleryId, true); // lets back work properly
                lightbox.loadGalleryfromJson(images, parseInt(match[1], 10));
            } else {
                res = /^#(?:img-)?(\d+)$/.exec(galleryHash);
                if (res) {
                    lightbox.loadGalleryfromJson(images, parseInt(res[1], 10));
                }
            }
        }
    }

    return {
        init: bootstrap,
        GalleryLightbox: GalleryLightbox
    };
});
