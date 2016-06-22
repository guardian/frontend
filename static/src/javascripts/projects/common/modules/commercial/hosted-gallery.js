define([
    'bean',
    'lodash/functions/debounce',
    'bonzo',
    'fastdom',
    'common/utils/$',
    'qwery',
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
    'common/utils/chain',
    'common/utils/load-css-promise'
], function (
    bean,
    debounce,
    bonzo,
    fastdom,
    $,
    qwery,
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
    chain,
    loadCssPromise
) {


    function HostedGallery() {

        // CONFIG
        this.useSwipe = detect.hasTouchScreen();
        this.swipeThreshold = 0.05;
        this.resize = this.trigger.bind(this, 'resize');
        this.index = this.index || 1;


        // ELEMENT BINDINGS
        this.$galleryEl = $('.js-hosted-gallery-container');
        this.$imagesContainer = $('.js-hosted-gallery-images');
        this.$captionContainer = $('.hosted-gallery__captions');
        this.$captions = $('.hosted-gallery__caption', this.$captionContainer);
        this.$scrollEl = $('.hosted-gallery__scroll-container', this.$galleryEl);
        this.$images = $('.hosted-gallery__image', this.$galleryEl);
        this.$progress = $('.hosted-gallery__progress', this.$galleryEl);
        this.$border = $('.hosted-gallery__progress--border-2', this.$progress);
        this.prevBtn = qwery('.inline-arrow-up', this.$progress)[0];
        this.nextBtn = qwery('.inline-arrow-down', this.$progress)[0];
        this.infoBtn = qwery('.js-gallery-caption-button', this.$captionContainer)[0];
        this.$counter = $('.hosted-gallery__image-count', this.$progress);

        // FSM CONFIG
        this.fsm = new FiniteStateMachine({
            initial: 'image',
            onChangeState: function (oldState, newState) {
                this.$galleryEl
                    .removeClass('hosted-gallery--' + oldState)
                    .addClass('hosted-gallery--' + newState);
            },
            context: this,
            states: this.states
        });

        bean.on(this.infoBtn, 'click', this.trigger.bind(this, 'toggle-info'));
        this.loadSurroundingImages(1, this.$images.length);

        if (this.useSwipe) {
            this.$galleryEl.addClass('use-swipe');
            this.initSwipe();
        } else {
            this.$galleryEl.addClass('use-scroll');
            this.initScroll();
        }
    }

    HostedGallery.prototype.initScroll = function () {
        bean.on(document.body, 'keydown', this.handleKeyEvents.bind(this));

        bean.on(this.nextBtn, 'click', this.scrollTo.bind(this, 1));
        bean.on(this.prevBtn, 'click', this.scrollTo.bind(this, -1));

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
                    this.trigger('prev');
                } else {
                    this.trigger('reload');
                }
            } else if (direction === -1) {
                if (this.index < this.$images.length) {
                    this.trigger('next');
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
        var imageContent = config.page.images, $img;
        chain([-1, 0, 1]).and(
            map,
            function (i) { return index + i === 0 ? count - 1 : (index - 1 + i) % count; }
        ).and(forEach, function (i) {
            $img = bonzo(this.$images[i]);
            $img.css('background-image', 'url(' + imageContent[i] + ')');
        }.bind(this));

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
        var progress = Math.round(length * (scrollTop/scrollHeight) * 100) / 100;
        var fractionProgress = progress % 1;
        var deg = Math.ceil(fractionProgress * 360);
        var newIndex = Math.round(progress + 0.75);
        fastdom.write(function () {
            this.$images.each(function (image, index) {
                var opacity = (progress - index + 1) * 4 / 3;
                bonzo(image).css('opacity', Math.min(Math.max(opacity, 0), 1));
            });

            bonzo(this.$border).css('transform', 'rotate(' + deg + 'deg)');
            bonzo(this.$border).css('-webkit-transform', 'rotate(' + deg + 'deg)');
            ['quarter-2', 'quarter-3', 'quarter-4'].forEach(function (cssClass, index) {
                if (4 * fractionProgress > index + 1) {
                    bonzo(this.$progress).addClass(cssClass);
                } else {
                    bonzo(this.$progress).removeClass(cssClass);
                }
            }.bind(this));
        }.bind(this));

        if(newIndex && newIndex !== this.index){
            this.index = newIndex;
            this.trigger('reload');
        }
    };

    HostedGallery.prototype.scrollTo = function (direction) {
        var scrollEl = this.$scrollEl;
        var length = this.$images.length;
        var scrollTop = scrollEl[0].scrollTop;
        var scrollHeight = scrollEl[0].scrollHeight;
        var progress = length * (scrollTop/scrollHeight);
        var newIndex = Math.round(progress + (direction * 0.51));
        fastdom.write(function () {
            scrollEl.scrollTop(newIndex * scrollHeight / length);
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
                    if (that.index === index + 1) {
                        bonzo(caption).addClass('current-caption');
                    } else {
                        bonzo(caption).removeClass('current-caption');
                    }
                });
                bonzo(this.$counter).html(this.index + '/' + this.$images.length);
                if(this.useSwipe){
                    this.translateContent(this.index, 0, (this.useSwipe && detect.isBreakpoint({max: 'tablet'}) ? 100 : 0));
                }

                // event bindings
                mediator.on('window:resize', this.resize);
            },
            leave: function () {
                this.trigger('hide-info');
                mediator.off('window:resize', this.resize);
            },
            events: {
                'next': function () {
                    if (this.index === this.$images.length) { // last img
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
                    if (this.index === 1) { // first img
                        if (this.showEndslate) {
                            this.state = 'endslate';
                        } else {
                            this.index = this.$images.length;
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
                    this.$captionContainer.toggleClass('hosted-gallery--show-caption');
                },
                'hide-info': function () {
                    this.$captionContainer.removeClass('hosted-gallery--show-caption');
                },
                'show-info': function () {
                    this.$captionContainer.addClass('hosted-gallery--show-caption');
                },
                'resize': function () {
                    this.swipeContainerWidth = this.$galleryEl.dim().width;
                    this.loadSurroundingImages(this.index, this.$images.length); // regenerate src
                    this.translateContent(this.index, 0, 0);
                }
            }
        },

        'endslate': {
            enter: function () {
                if(this.useSwipe){
                    this.translateContent(this.$images.length, 0, 0);
                }
                this.index = this.$images.length + 1;
                mediator.on('window:resize', this.resize);
            },
            leave: function () {
                mediator.off('window:resize', this.resize);
            },
            events: {
                'next': function () {
                    this.index = 1;
                    this.state = 'image';
                },
                'prev': function () {
                    this.index = this.$images.length;
                    this.state = 'image';
                },
                'reload': function () {
                    this.reloadState = true;
                },
                'resize': function () {
                    this.swipeContainerWidth = this.$galleryEl.dim().width;
                    if(this.useSwipe){
                        this.translateContent(this.$images.length, 0, 0);
                    }
                }
            }
        }
    };

    HostedGallery.prototype.handleKeyEvents = function (e) {
        if (e.keyCode === 38) { // up
            e.preventDefault();
            this.scrollTo(-1);
            return false;
        } else if (e.keyCode === 40) { // down
            e.preventDefault();
            this.scrollTo(1);
            return false;
        } else if (e.keyCode === 73) { // 'i'
            this.trigger('toggle-info');
        }
    };

    function bootstrap() {
        loadCssPromise.then(function () {
            var gallery,
                match,
                galleryHash = window.location.hash,
                res;

            gallery = new HostedGallery();
            match = /\?index=(\d+)/.exec(document.location.href);
            if (match) { // index specified so launch gallery at that index
                gallery.index = parseInt(match[1], 10);
            } else {
                res = /^#(?:img-)?(\d+)$/.exec(galleryHash);
                if (res) {
                    gallery.index = parseInt(res[1], 10);
                }
            }
        });
    }

    return {
        init: bootstrap,
        HostedGallery: HostedGallery
    };
});
