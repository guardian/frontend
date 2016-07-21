define([
    'bean',
    'lodash/functions/debounce',
    'bonzo',
    'fastdom',
    'common/utils/$',
    'qwery',
    'common/utils/config',
    'common/utils/url',
    'common/utils/detect',
    'common/utils/fsm',
    'common/utils/mediator',
    'lodash/collections/map',
    'lodash/functions/throttle',
    'lodash/collections/forEach',
    'common/modules/analytics/omniture',
    'common/utils/chain',
    'common/utils/load-css-promise'
], function (bean,
             debounce,
             bonzo,
             fastdom,
             $,
             qwery,
             config,
             url,
             detect,
             FiniteStateMachine,
             mediator,
             map,
             throttle,
             forEach,
             omniture,
             chain,
             loadCssPromise) {


    function HostedGallery() {
        // CONFIG
        this.useSwipe = detect.hasTouchScreen();
        this.swipeThreshold = 0.05;
        this.index = this.index || 1;
        this.imageRatios = [];

        // ELEMENT BINDINGS
        this.$galleryEl = $('.js-hosted-gallery-container');
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
        this.$ctaFloat = $('.js-hosted-gallery-cta-float', this.$galleryEl)[0];
        this.$ojFloat = $('.js-hosted-gallery-oj-float', this.$galleryEl)[0];

        if (this.$galleryEl.length) {
            this.resize = this.trigger.bind(this, 'resize');
            mediator.on('window:resize', this.resize);

            // FSM CONFIG
            this.fsm = new FiniteStateMachine({
                initial: 'image',
                onChangeState: function () {},
                context: this,
                states: this.states
            });

            bean.on(this.infoBtn, 'click', this.trigger.bind(this, 'toggle-info'));
            bean.on(document.body, 'keydown', this.handleKeyEvents.bind(this));
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

    HostedGallery.prototype.initScroll = function () {
        bean.on(this.nextBtn, 'click', function(){
            this.scrollTo(this.index + 1);
            this.trigger.bind(this, 'next', {nav: 'Click'});
        }.bind(this));
        bean.on(this.prevBtn, 'click', function(){
            this.scrollTo(this.index - 1);
            this.trigger.bind(this, 'prev', {nav: 'Click'});
        }.bind(this));

        bean.on(this.$scrollEl[0], 'scroll', throttle(this.fadeContent.bind(this), 20));
    };

    HostedGallery.prototype.initSwipe = function () {
        var threshold, ox, dx, touchMove,
            updateTime = 20; // time in ms
        this.swipeContainerWidth = this.$galleryEl.dim().width;
        this.$imagesContainer.css('width', this.$images.length + '00%');

        bean.on(this.$galleryEl[0], 'touchstart', function (e) {
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

        bean.on(this.$galleryEl[0], 'touchmove', throttle(touchMove, updateTime, {trailing: false}));

        bean.on(this.$galleryEl[0], 'touchend', function () {
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

    HostedGallery.prototype.trigger = function (event, data) {
        this.fsm.trigger(event, data);
    };

    HostedGallery.prototype.loadSurroundingImages = function (index, count) {
        var $img, that = this;
        chain([0, 1, 2]).and(
            map,
            function (i) {
                return index + i === 0 ? count - 1 : (index - 1 + i) % count;
            }
        ).and(forEach, function (i) {
            $img = $('img', this.$images[i]);
            if (!$img[0].complete) {
                bean.one($img[0], 'load', setSize.bind(this, $img, i));
            } else {
                setSize($img, i);
            }
        }.bind(this));

        function setSize($image, index) {
            if (!that.imageRatios[index]) {
                that.imageRatios[index] = $image[0].naturalWidth / $image[0].naturalHeight;
            }
            that.resizeImage.call(that, index);
        }
    };

    HostedGallery.prototype.resizeImage = function (imgIndex) {
        var $imageDiv = this.$images[imgIndex],
            $imagesContainer = this.$imagesContainer[0],
            $gallery = this.$galleryEl[0],
            $ctaFloat = this.$ctaFloat,
            $ojFloat = this.$ojFloat,
            $images = this.$images,
            width = $gallery.clientWidth,
            height = $imagesContainer.clientHeight,
            $sizer = $('.js-hosted-gallery-image-sizer', $imageDiv),
            imgRatio = this.imageRatios[imgIndex],
            ctaSize = getFrame(imgRatio < 1 ? 0 : 5 / 3),
            imageSize = getFrame(imgRatio < 1 ? imgRatio : 5 / 3);
        fastdom.write(function () {
            $sizer.css('width', imageSize.width);
            $sizer.css('height', imageSize.height);
            $sizer.css('top', imageSize.topBottom);
            $sizer.css('left', imageSize.leftRight);
            if (imgIndex === config.page.ctaIndex) {
                bonzo($ctaFloat).css('bottom', ctaSize.topBottom);
            }
            if (imgIndex === $images.length - 1) {
                bonzo($ojFloat).css('bottom', ctaSize.topBottom);
            }
            if (imgIndex === $images.length - 1) {
                bonzo($ojFloat).css('padding-bottom', ctaSize.topBottom > 40 ? 20 : 40);
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
            galleryEl = this.$imagesContainer[0];
        galleryEl.style.webkitTransitionDuration = duration + 'ms';
        galleryEl.style.mozTransitionDuration = duration + 'ms';
        galleryEl.style.msTransitionDuration = duration + 'ms';
        galleryEl.style.transitionDuration = duration + 'ms';
        galleryEl.style.webkitTransform = 'translate(' + (px + offset) + 'px,0)' + 'translateZ(0)';
        galleryEl.style.mozTransform = 'translate(' + (px + offset) + 'px,0)';
        galleryEl.style.msTransform = 'translate(' + (px + offset) + 'px,0)';
        galleryEl.style.transform = 'translate(' + (px + offset) + 'px,0)' + 'translateZ(0)';
    };

    HostedGallery.prototype.fadeContent = function (e) {
        var length = this.$images.length;
        var scrollTop = e.target.scrollTop;
        var scrollHeight = e.target.scrollHeight;
        var progress = Math.round(length * (scrollTop / scrollHeight) * 100) / 100;
        var fractionProgress = progress % 1;
        var deg = Math.ceil(fractionProgress * 360);
        var newIndex = Math.round(progress + 0.75);
        var ctaIndex = config.page.ctaIndex;
        fastdom.write(function () {
            this.$images.each(function (image, index) {
                var opacity = (progress - index + 1) * 4 / 3;
                bonzo(image).css('opacity', Math.min(Math.max(opacity, 0), 1));
            });

            bonzo(this.$border).css('transform', 'rotate(' + deg + 'deg)');
            bonzo(this.$border).css('-webkit-transform', 'rotate(' + deg + 'deg)');

            bonzo(this.$galleryEl).toggleClass('show-cta', progress <= ctaIndex && progress >= ctaIndex - 0.25);
            bonzo(this.$galleryEl).toggleClass('show-oj', progress >= length - 1.25);

            bonzo(this.$progress).toggleClass('first-half', fractionProgress && fractionProgress < 0.5);

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
                this.swipeContainerWidth = this.$galleryEl.dim().width;

                // load prev/current/next
                this.loadSurroundingImages(this.index, this.$images.length);
                this.$captions.each(function (caption, index) {
                    bonzo(caption).toggleClass('current-caption', that.index === index + 1);
                });
                bonzo(this.$counter).html(this.index + '/' + this.$images.length);

                if (this.useSwipe) {
                    this.translateContent(this.index, 0, 100);
                    bonzo(this.$galleryEl).toggleClass('show-oj', this.index === this.$images.length);
                    bonzo(this.$galleryEl).toggleClass('show-cta', this.index === config.page.ctaIndex + 1);
                }

                url.pushUrl({}, document.title, config.page.pageName + '#img-' + this.index, true);
                // event bindings
                mediator.on('window:resize', this.resize);
            },
            leave: function () {
                this.trigger('hide-info');
                mediator.off('window:resize', this.resize);
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
            omniture.trackLinkImmediate(config.page.trackingPrefix + data.nav + ' - image ' + this.index);
        }
    };

    HostedGallery.prototype.onResize = function () {
        this.resizer = this.resizer || function () {
                this.loadSurroundingImages(this.index, this.$images.length);
                if (this.useSwipe) {
                    this.swipeContainerWidth = this.$galleryEl.dim().width;
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
            $progress = this.$progress,
            $ctaFloat = this.$ctaFloat,
            $ojFloat = this.$ojFloat,
            imgRatio = 5 / 3,
            imageWidth = width,
            leftRight = 0;
        if (imgRatio < width / height) {
            imageWidth = height * imgRatio;
            leftRight = (width - imageWidth) / 2 + 'px';
        }
        fastdom.write(function () {
            $header.css('width', imageWidth);
            $footer.css('padding', '0 ' + leftRight);
            $progress.css('right', leftRight);
            bonzo($ctaFloat).css('left', leftRight);
            bonzo($ojFloat).css('left', leftRight);
            bonzo($ctaFloat).css('right', leftRight);
            bonzo($ojFloat).css('right', leftRight);
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
        return loadCssPromise.then(function () {
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
        });
    }

    return {
        init: init,
        HostedGallery: HostedGallery
    };
});
