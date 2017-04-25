define([
    'Promise',
    'bonzo',
    'fastdom',
    'lib/$',
    'qwery',
    'lib/config',
    'lib/url',
    'lib/detect',
    'lib/fsm',
    'lib/mediator',
    'lodash/functions/throttle',
    'common/modules/analytics/interaction-tracking',
    'lib/load-css-promise'
], function (Promise,
             bonzo,
             fastdom,
             $,
             qwery,
             config,
             url,
             detect,
             FiniteStateMachine,
             mediator,
             throttle,
             interactionTracking,
             loadCssPromise) {


    function HostedGallery() {
        // CONFIG
        var breakpoint = detect.getBreakpoint();
        this.useSwipe = detect.hasTouchScreen() && (breakpoint === 'mobile' || breakpoint === 'tablet');
        this.swipeThreshold = 0.05;
        this.index = this.index || 1;
        this.imageRatios = [];

        // ELEMENT BINDINGS
        this.$galleryEl = $('.js-hosted-gallery-container');
        this.$galleryFrame = $('.js-hosted-gallery-frame');
        this.$header = $('.js-hosted-headerwrap');
        this.$imagesContainer = $('.js-hosted-gallery-images', this.$galleryEl);
        this.$captionContainer = $('.js-gallery-caption-bar');
        this.$captions = $('.js-hosted-gallery-caption', this.$captionContainer);
        this.$scrollEl = $('.js-hosted-gallery-scroll-container', this.$galleryEl);
        this.$images = $('.js-hosted-gallery-image', this.$imagesContainer);
        this.$progress = $('.js-hosted-gallery-progress', this.$galleryEl);
        this.$border = $('.js-hosted-gallery-rotating-border', this.$progress);
        this.prevBtn = qwery('.inline-arrow-up', this.$progress)[0];
        this.nextBtn = qwery('.inline-arrow-down', this.$progress)[0];
        this.infoBtn = qwery('.js-gallery-caption-button', this.$captionContainer)[0];
        this.$counter = $('.js-hosted-gallery-image-count', this.$progress);
        this.$ctaFloat = $('.js-hosted-gallery-cta', this.$galleryEl)[0];
        this.$ojFloat = $('.js-hosted-gallery-oj', this.$galleryEl)[0];
        this.$meta = $('.js-hosted-gallery-meta', this.$galleryEl)[0];
        this.ojClose = qwery('.js-hosted-gallery-oj-close', this.$ojFloat)[0];

        if (this.$galleryEl.length) {
            this.resize = this.trigger.bind(this, 'resize');
            mediator.on('window:throttledResize', this.resize);

            // FSM CONFIG
            this.fsm = new FiniteStateMachine({
                initial: 'image',
                onChangeState: function () {},
                context: this,
                states: this.states
            });

            this.infoBtn.addEventListener('click', this.trigger.bind(this, 'toggle-info'));
            this.ojClose.addEventListener('click', this.toggleOj.bind(this));
            document.body.addEventListener('keydown', this.handleKeyEvents.bind(this));
            this.loadSurroundingImages(1, this.$images.length);
            this.setPageWidth();

            if (this.useSwipe) {
                this.$galleryEl.addClass('use-swipe');
                this.initSwipe();
            } else {
                this.$galleryEl.addClass('use-scroll');
                this.initScroll();
            }
        }
    }

    HostedGallery.prototype.toggleOj = function () {
        bonzo(this.$ojFloat).toggleClass('minimise-oj');
    };

    HostedGallery.prototype.initScroll = function () {
        this.nextBtn.addEventListener('click', function(){
            this.scrollTo(this.index + 1);
            if (this.index < this.$images.length) {
                this.trigger('next', {nav: 'Click'});
            } else {
                this.trigger('reload');
            }
        }.bind(this));
        this.prevBtn.addEventListener('click', function(){
            this.scrollTo(this.index - 1);
            if (this.index > 1) {
                this.trigger('prev', {nav: 'Click'});
            } else {
                this.trigger('reload');
            }
        }.bind(this));

        this.$scrollEl[0].addEventListener('scroll', throttle(this.fadeContent.bind(this), 20));
    };

    HostedGallery.prototype.initSwipe = function () {
        var threshold, ox, dx, touchMove,
            updateTime = 20; // time in ms
        this.$imagesContainer.css('width', this.$images.length + '00%');

        this.$galleryEl[0].addEventListener('touchstart', function (e) {
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

        this.$galleryEl[0].addEventListener('touchmove', throttle(touchMove, updateTime, {trailing: false}));

        this.$galleryEl[0].addEventListener('touchend', function () {
            var direction;
            if (Math.abs(dx) > threshold) {
                direction = dx > threshold ? 1 : -1;
            } else {
                direction = 0;
            }
            dx = 0;

            if (direction === 1) {
                if (this.index > 1) {
                    this.trigger('prev', {nav: 'Swipe'});
                } else {
                    this.trigger('reload');
                }
            } else if (direction === -1) {
                if (this.index < this.$images.length) {
                    this.trigger('next', {nav: 'Swipe'});
                } else {
                    this.trigger('reload');
                }
            } else {
                this.trigger('reload');
            }

        }.bind(this));
    };

    HostedGallery.prototype.ctaIndex = function () {
        var ctaIndex = config.page.ctaIndex;
        var images = config.page.images;
        return (ctaIndex > 0 && ctaIndex < images.length - 1) ? ctaIndex : undefined;
    };

    HostedGallery.prototype.trigger = function (event, data) {
        this.fsm.trigger(event, data);
    };

    HostedGallery.prototype.loadSurroundingImages = function (index, count) {
        var $img, that = this;
        [0, 1, 2]
        .map(function (i) {
            return index + i === 0 ? count - 1 : (index - 1 + i) % count;
        })
        .forEach(function (i) {
            $img = $('img', this.$images[i]);
            if (!$img[0].complete) {
                $img[0].addEventListener('load', setSize.bind(this, $img, i));
            } else {
                setSize($img, i);
            }
        }, this);

        function setSize($image, index) {
            if (!that.imageRatios[index]) {
                that.imageRatios[index] = $image[0].naturalWidth / $image[0].naturalHeight;
            }
            that.resizeImage.call(that, index);
        }
    };

    HostedGallery.prototype.resizeImage = function (imgIndex) {
        var $imageDiv = this.$images[imgIndex],
            $galleryFrame = this.$galleryFrame[0],
            $ctaFloat = this.$ctaFloat,
            $ojFloat = this.$ojFloat,
            $meta = this.$meta,
            $images = this.$images,
            width = $galleryFrame.clientWidth,
            height = $galleryFrame.clientHeight,
            $sizer = $('.js-hosted-gallery-image-sizer', $imageDiv),
            imgRatio = this.imageRatios[imgIndex],
            ctaSize = getFrame(0),
            ctaIndex = this.ctaIndex(),
            tabletSize = 740,
            imageSize = getFrame(imgRatio);
        fastdom.write(function () {
            $sizer.css('width', imageSize.width);
            $sizer.css('height', imageSize.height);
            $sizer.css('top', imageSize.topBottom);
            $sizer.css('left', imageSize.leftRight);
            if (imgIndex === ctaIndex) {
                bonzo($ctaFloat).css('bottom', ctaSize.topBottom);
            }
            if (imgIndex === $images.length - 1) {
                bonzo($ojFloat).css('bottom', ctaSize.topBottom);
            }
            if (imgIndex === $images.length - 1) {
                bonzo($ojFloat).css('padding-bottom', (ctaSize.topBottom > 40 || width > tabletSize) ? 0 : 40);
            }
            if (imgIndex === 0) {
                bonzo($meta).css('padding-bottom', (imageSize.topBottom > 40 || width > tabletSize) ? 20 : 40);
            }
        });
        function getFrame(desiredRatio, w, h) {
            w = w || width;
            h = h || height;
            var frame = {
                height: h,
                width: w,
                topBottom: 0,
                leftRight: 0
            };
            if (!desiredRatio) return frame;
            if (desiredRatio > w / h) {
                // portrait screens
                frame.height = w / desiredRatio;
                frame.topBottom = (h - frame.height) / 2;
            } else {
                // landscape screens
                frame.width = h * desiredRatio;
                frame.leftRight = (w - frame.width) / 2;
            }
            return frame;
        }
    };

    HostedGallery.prototype.translateContent = function (imgIndex, offset, duration) {
        var px = -1 * (imgIndex - 1) * this.swipeContainerWidth,
            galleryEl = this.$imagesContainer[0],
            $meta = this.$meta;
        galleryEl.style.webkitTransitionDuration = duration + 'ms';
        galleryEl.style.mozTransitionDuration = duration + 'ms';
        galleryEl.style.msTransitionDuration = duration + 'ms';
        galleryEl.style.transitionDuration = duration + 'ms';
        galleryEl.style.webkitTransform = 'translate(' + (px + offset) + 'px,0)' + 'translateZ(0)';
        galleryEl.style.mozTransform = 'translate(' + (px + offset) + 'px,0)';
        galleryEl.style.msTransform = 'translate(' + (px + offset) + 'px,0)';
        galleryEl.style.transform = 'translate(' + (px + offset) + 'px,0)' + 'translateZ(0)';
        fastdom.write(function () {
            bonzo($meta).css('opacity', offset != 0 ? 0 : 1);
        });
    };

    HostedGallery.prototype.fadeContent = function (e) {
        var length = this.$images.length;
        var scrollTop = e.target.scrollTop;
        var scrollHeight = e.target.scrollHeight;
        var progress = Math.round(length * (scrollTop / scrollHeight) * 100) / 100;
        var fractionProgress = progress % 1;
        var deg = Math.ceil(fractionProgress * 360);
        var newIndex = Math.round(progress + 0.75);
        var ctaIndex = this.ctaIndex();
        fastdom.write(function () {
            this.$images.each(function (image, index) {
                var opacity = ((progress - index + 1) * 16 / 11) - 0.0625;
                bonzo(image).css('opacity', Math.min(Math.max(opacity, 0), 1));
            });

            bonzo(this.$border).css('transform', 'rotate(' + deg + 'deg)');
            bonzo(this.$border).css('-webkit-transform', 'rotate(' + deg + 'deg)');

            bonzo(this.$galleryEl).toggleClass('show-cta', progress <= ctaIndex && progress >= ctaIndex - 0.25);
            bonzo(this.$galleryEl).toggleClass('show-oj', progress >= length - 1.25);

            bonzo(this.$progress).toggleClass('first-half', fractionProgress && fractionProgress < 0.5);

            bonzo(this.$meta).css('opacity', progress != 0 ? 0 : 1);
        }.bind(this));

        if (newIndex && newIndex !== this.index) {
            this.index = newIndex;
            this.trigger('reload', {nav: 'Scroll'});
        }
    };

    HostedGallery.prototype.scrollTo = function (index) {
        var scrollEl = this.$scrollEl;
        var length = this.$images.length;
        var scrollHeight = scrollEl[0].scrollHeight;
        fastdom.write(function () {
            scrollEl.scrollTop((index - 1) * scrollHeight / length);
        });
    };


    HostedGallery.prototype.states = {
        'image': {
            enter: function () {
                var that = this;

                // load prev/current/next
                this.loadSurroundingImages(this.index, this.$images.length);
                this.$captions.each(function (caption, index) {
                    bonzo(caption).toggleClass('current-caption', that.index === index + 1);
                });
                bonzo(this.$counter).html(this.index + '/' + this.$images.length);

                if (this.useSwipe) {
                    this.translateContent(this.index, 0, 100);
                    bonzo(this.$galleryEl).toggleClass('show-oj', this.index === this.$images.length);
                    bonzo(this.$galleryEl).toggleClass('show-cta', this.index === this.ctaIndex() + 1);
                }

                var pageName = config.page.pageName || window.location.pathname.substr(window.location.pathname.lastIndexOf('/') + 1);
                url.pushUrl({}, document.title, pageName + '#img-' + this.index, true);
                // event bindings
                mediator.on('window:throttledResize', this.resize);
            },
            leave: function () {
                this.trigger('hide-info');
                mediator.off('window:throttledResize', this.resize);
            },
            events: {
                'next': function (e) {
                    if (this.index < this.$images.length) { // last img
                        this.index += 1;
                        this.trackNavBetweenImages(e);
                    }
                    this.reloadState = true;
                },
                'prev': function (e) {
                    if (this.index > 1) { // first img
                        this.index -= 1;
                        this.trackNavBetweenImages(e);
                    }
                    this.reloadState = true;
                },
                'reload': function (e) {
                    this.trackNavBetweenImages(e);
                    this.reloadState = true;
                },
                'toggle-info': function () {
                    this.$captionContainer.toggleClass('hosted-gallery--show-caption');
                },
                'hide-info': function () {
                    this.$captionContainer.removeClass('hosted-gallery--show-caption');
                },
                'show-info': function () {
                    this.$captionContainer.addClass('hosted-gallery--show-caption');
                },
                'resize': function () {
                    this.onResize();
                }
            }
        }
    };

    HostedGallery.prototype.trackNavBetweenImages = function (data) {
        if (data && data.nav) {
            var trackingPrefix = config.page.trackingPrefix || '';
            interactionTracking.trackNonClickInteraction(trackingPrefix + data.nav + ' - image ' + this.index);
        }
    };

    HostedGallery.prototype.onResize = function () {
        this.resizer = this.resizer || function () {
                this.loadSurroundingImages(this.index, this.$images.length);
                if (this.useSwipe) {
                    this.swipeContainerWidth = this.$galleryFrame.dim().width;
                    this.translateContent(this.index, 0, 0);
                }
                this.setPageWidth();
            }.bind(this);
        throttle(this.resizer, 200)();
    };

    HostedGallery.prototype.setPageWidth = function () {
        var $imagesContainer = this.$imagesContainer[0],
            $gallery = this.$galleryEl[0],
            width = $gallery.clientWidth,
            height = $imagesContainer.clientHeight,
            $header = this.$header,
            $footer = this.$captionContainer,
            $galleryFrame = this.$galleryFrame,
            imgRatio = 5 / 3,
            imageWidth = width,
            leftRight = 0,
            that = this;
        if (imgRatio < width / height) {
            imageWidth = height * imgRatio;
            leftRight = (width - imageWidth) / 2 + 'px';
        }
        this.swipeContainerWidth = imageWidth;
        fastdom.write(function () {
            $header.css('width', imageWidth);
            $footer.css('margin', '0 ' + leftRight);
            $footer.css('width', 'auto');
            $galleryFrame.css('left', leftRight);
            $galleryFrame.css('right', leftRight);
            that.loadSurroundingImages(that.index, that.$images.length);
        });
    };

    HostedGallery.prototype.handleKeyEvents = function (e) {
        var keyNames = {
            '37': 'left',
            '38': 'up',
            '39': 'right',
            '40': 'down'
        };
        if (e.keyCode === 37 || e.keyCode === 38) { // up/left
            e.preventDefault();
            this.scrollTo(this.index - 1);
            this.trigger('prev', {nav: 'KeyPress:' + keyNames[e.keyCode]});
            return false;
        } else if (e.keyCode === 39 || e.keyCode === 40) { // down/right
            e.preventDefault();
            this.scrollTo(this.index + 1);
            this.trigger('next', {nav: 'KeyPress:' + keyNames[e.keyCode]});
            return false;
        } else if (e.keyCode === 73) { // 'i'
            this.trigger('toggle-info');
        }
    };

    HostedGallery.prototype.loadAtIndex = function (i) {
        this.index = i;
        this.trigger('reload');
        if(this.useSwipe){
            this.translateContent(this.index, 0, 0);
        } else {
            this.scrollTo(this.index);
        }
    };

    function init() {
        if (qwery('.js-hosted-gallery-container').length) {
            return loadCssPromise.loadCssPromise
                .then(function () {
                    var gallery,
                        match,
                        galleryHash = window.location.hash,
                        res;

                    gallery = new HostedGallery();
                    match = /\?index=(\d+)/.exec(document.location.href);
                    if (match) { // index specified so launch gallery at that index
                        gallery.loadAtIndex(parseInt(match[1], 10));
                    } else {
                        res = /^#(?:img-)?(\d+)$/.exec(galleryHash);
                        if (res) {
                            gallery.loadAtIndex(parseInt(res[1], 10));
                        }
                    }

                    return gallery;
                });
        }

        return Promise.resolve();
    }

    return {
        init: init,
        HostedGallery: HostedGallery
    };
});
