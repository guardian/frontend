define([
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'bean',
    'common/utils/mediator',
    'bonzo',
    'qwery',
    'common/utils/ajax',
    'common/utils/fsm',
    'common/utils/detect',
    'common/modules/component',
    'common/modules/ui/images',
    'common/utils/url'
], function (
    $,
    _,
    config,
    bean,
    mediator,
    bonzo,
    qwery,
    ajax,
    FiniteStateMachine,
    detect,
    Component,
    imagesModule,
    url
) {
    function GalleryLightbox() {

        // CONFIG
        this.adStep = 4; // advert between every 4th and 5th image
        this.showEndslate = !detect.isBreakpoint('mobile');
        this.showAdverts  = false;
        this.useSwipe = detect.hasTouchScreen();

        // TEMPLATE
        function generateButtonHTML(label) {
            var templ = '<div class="gallery-lightbox__btn gallery-lightbox__btn--{{label}} js-gallery-{{label}}">' +
                        '<div class="gallery-lightbox__btn-body"><i></i></div>' +
                    '</div>';
            return templ.replace(/{{label}}/g, label);
        }

        this.imgElementHtml =
            '<li class="gallery-lightbox__item">' +
                '<img class="gallery-lightbox__img js-gallery-lightbox-img"">' +
                '<div class="gallery-lightbox__info">' +
                    '<div class="gallery-lightbox__progress gallery-lightbox__progress--info">' +
                        '<span class="gallery-lightbox__index">${index}</span>' +
                        '<span class="gallery-lightbox__progress-separator"></span>' +
                        '<span class="gallery-lightbox__count">${count}</span>' +
                    '</div>' +
                    '<div class="gallery-lightbox__img-caption">${caption}</div>' +
                    '<div class="gallery-lightbox__img-credit">${credit}</div>' +
                '</div>' +
            '</li>';


        this.galleryLightboxHtml =
            '<div class="overlay gallery-lightbox gallery-lightbox--closed gallery-lightbox--hover">' +
                '<div class="pamplemousse gallery-lightbox__loader">' +
                    '<div class="pamplemousse__pip"><i></i></div>' +
                    '<div class="pamplemousse__pip"><i></i></div>' +
                    '<div class="pamplemousse__pip"><i></i></div>' +
                '</div>' +
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
        bean.on(this.nextBtn, 'click', this.trigger.bind(this, 'next'));
        bean.on(this.prevBtn, 'click', this.trigger.bind(this, 'prev'));
        bean.on(this.closeBtn, 'click', this.close.bind(this));
        bean.on(this.infoBtn, 'click', this.trigger.bind(this, 'toggle-info'));
        this.handleKeyEvents = this._handleKeyEvents.bind(this); // bound for event handler
        this.toggleInfo = this.trigger.bind(this, 'toggle-info');
        this.resize = this.trigger.bind(this, 'resize');

        if (detect.hasTouchScreen()) {
            this.disableHover();
        }

        bean.on(window, 'popstate', function(event) {
            if (event.state === null) {
                this.trigger('close');
            }
        }.bind(this));

        // FSM CONFIG
        this.fsm = new FiniteStateMachine({
            initial: 'closed',
            onChangeState: function(oldState, newState) {
                this.$lightboxEl
                    .removeClass('gallery-lightbox--' + oldState)
                    .addClass('gallery-lightbox--' + newState);
            },
            context: this,
            states: this.states
        });
    }

    GalleryLightbox.prototype.initSwipe = function() {
        this.swipe && this.swipe.kill();
        this.$lightboxEl.addClass('gallery-lightbox--swipe');
        require('js!swipe', function() {
            this.swipe = new Swipe(qwery('.js-gallery-swipe')[0], {
                startSlide: this.index,
                speed: 200,
                continuous: true,
                stopPropagation: true,
                disableScroll: true,
                callback: function(index) {
                    var swipeDir = (index > this.index) ? 'next' : 'prev';
                    this.trigger(swipeDir, 'swipe');
                }.bind(this)
            });
        }.bind(this));
    };

    GalleryLightbox.prototype.disableHover = function() {
        this.$lightboxEl.removeClass('gallery-lightbox--hover');
    };

    GalleryLightbox.prototype.trigger = function(event, data) {
        this.fsm.trigger(event, data);
    };

    GalleryLightbox.prototype.loadGalleryfromJson = function(galleryJson, startIndex) {
        this.index = startIndex;
        if (this.galleryJson && galleryJson.id === this.galleryJson.id) {
            this.trigger('open');
        } else {
            this.trigger('loadJson', galleryJson);
        }
    };

    GalleryLightbox.prototype.getImgSrc = function(imgJson) {
        var dim = this.$lightboxEl.dim(),
            possibleWidths = _.filter(imagesModule.availableWidths, function(w) {
                var widthBigger = w > dim.width,
                    calculatedHeight = (w/imgJson.ratio),
                    heightBigger =  calculatedHeight > dim.height;
                return widthBigger || heightBigger;
            }).sort(function(a,b){ return a > b; }),
            chosenWidth = possibleWidths.length ? possibleWidths[0] : '-';

        return imgJson.src.replace('{width}', chosenWidth);
    };

    GalleryLightbox.prototype.endslate = new Component();

    GalleryLightbox.prototype.loadSurroundingImages = function(index, count) {
        _([-1,0,1]).each(function(i){
            var imgIndex = index+i === 0 ? count - 1 : (index-1+i) % count, // wrap both ways
                imgSrc = this.getImgSrc(this.images[imgIndex]),
                $img = bonzo(this.$images[imgIndex]);
            $img.attr('src', imgSrc); // src can change with width so overwrite every time
        }.bind(this));
    };

    GalleryLightbox.prototype.states = {

        'closed': {
            enter: function() {
                this.hide();
                this.galleryJson = undefined;
            },
            leave: function() {
                this.show();
                url.pushUrl({}, document.title, '/' + this.galleryJson.id);
            },
            events: {
                'open': function() {
                    this.swipe && this.swipe.slide(this.index, 0);
                    this.state = 'image';
                },
                'loadJson': function(json) {
                    this.galleryJson = json;
                    this.images = json.images;
                    this.$countEl.text(this.images.length + (this.showEndslate ? 1 : 0));

                    var imagesHtml = _(this.images)
                        .map(function(img, i) {
                            return _(this.imgElementHtml)
                                .template({count: this.images.length, index: i + 1}, {imports: img});
                        }.bind(this))
                        .join('');

                    this.$contentEl.html(imagesHtml);

                    this.$images = $('.js-gallery-lightbox-img', this.$contentEl[0]);

                    if (this.useSwipe) {
                        this.initSwipe();
                    }

                    this.state = 'image';
                }
            }
        },

        'image': {
            enter: function() {
                url.pushUrl({}, document.title, '/' + this.galleryJson.id + '?index=' + this.index, true);

                // event bindings
                bean.on(this.$contentEl[0], 'click', this.toggleInfo);
                mediator.on('window:resize', this.resize);
                if (!this.$images[this.index-1].src) {
                    this.$lightboxEl.addClass('gallery-lightbox--loading-img');
                    bean.one(this.$images[this.index-1], 'load', this.trigger.bind(this, 'loaded'));
                }

                // meta
                this.$indexEl.text(this.index);

                // load prev/current/next
                this.loadSurroundingImages(this.index, this.images.length);

                if(this.index > (this.images.length - 3)) {
                    this.loadEndslate();
                }
            },
            leave: function() {
                bonzo(this.imgEl).remove();
                bean.off(this.$contentEl[0], 'click', this.toggleInfo);
                mediator.off('window:resize', this.resize);
                this.imgEl = undefined;
            },
            events: {
                'next': function(interactionType) {
                    this.trackInteraction(interactionType + ':next');
                    this.pulseButton(this.nextBtn);
                    if (this.index === this.images.length) { // last img
                        if (this.showEndslate) {
                            this.state = 'endslate';
                        } else {
                            this.index = 1;
                            this.reloadState = true;
                        }
                    }
                    else if (this.showShouldAds() && this.index % this.adStep === 0) {
                        this.adIndex = this.index / this.adStep;
                        this.state = 'advert';
                    } else {
                        this.index += 1;
                        this.reloadState = true;
                    }
                },
                'prev': function(interactionType) {
                    this.trackInteraction(interactionType + ':previous');
                    this.pulseButton(this.prevBtn);
                    if (this.index === 1) { // first img
                        if (this.showEndslate) {
                            this.state = 'endslate';
                        } else {
                            this.index = this.images.length;
                            this.reloadState = true;
                        }
                    }
                    else if (this.showShouldAds() && (this.index - 1) % this.adStep === 0) {
                        this.adIndex = (this.index - 1) / this.adStep;
                        this.state = 'advert';
                    } else {
                        this.index -= 1;
                        this.reloadState = true;
                    }
                },
                'toggle-info': function() {
                    this.pulseButton(this.infoBtn);
                    this.$lightboxEl.toggleClass('gallery-lightbox--show-info');
                },
                'loaded': function() {
                    this.$lightboxEl.removeClass('gallery-lightbox--loading-img');
                },
                'resize': function() {
                    this.loadSurroundingImages(this.index, this.images.length); // regenerate src
                },
                'close': function() { this.state = 'closed'; }
            }
        },

        'advert': {
            enter: function() {
                // show advert (use this.adIndex if needed)

            },
            leave: function() {
                // hide advert
            },
            events: {
                'next': function(interactionType) {
                    this.trackInteraction(interactionType + ':next');
                    this.pulseButton(this.nextBtn);
                    this.index = (this.adIndex * this.adStep) + 1;
                    this.state = 'image';
                },
                'prev': function(interactionType) {
                    this.trackInteraction(interactionType + ':previous');
                    this.pulseButton(this.prevBtn);
                    this.index = this.adIndex * this.adStep;
                    this.state = 'image';
                },
                'close': function() { this.state = 'closed'; }
            }
        },

        'endslate': {
            enter: function() {
                this.loadEndslate();
                this.$indexEl.text(this.images.length + 1);
                this.index = this.images.length + 1;
            },
            leave: function() {
            },
            events: {
                'next': function(interactionType) {
                    this.trackInteraction(interactionType + ':next');
                    this.pulseButton(this.nextBtn);
                    this.index = 1;
                    this.state = 'image';
                },
                'prev': function(interactionType) {
                    this.trackInteraction(interactionType + ':previous');
                    this.pulseButton(this.prevBtn);
                    this.index = this.images.length;
                    this.state = 'image';
                },
                'close': function() { this.state = 'closed'; }
            }
        }
    };

    GalleryLightbox.prototype.showShouldAds = function() {
        return this.showAdverts && !this.galleryJson.shouldHideAdverts;
    };

    GalleryLightbox.prototype.show = function() {
        var $body = bonzo(document.body);
        this.bodyScrollPosition = $body.scrollTop();
        $body.addClass('has-overlay');
        this.$lightboxEl.addClass('gallery-lightbox--open');
        bean.off(document.body, 'keydown', this.handleKeyEvents); // prevent double binding
        bean.on(document.body, 'keydown', this.handleKeyEvents);
    };

    GalleryLightbox.prototype.close = function() {
        url.hasHistorySupport ? url.back() : this.trigger('close');
    };

    GalleryLightbox.prototype.hide = function() {
        // remove has-overlay first to show body behind lightbox then scroll and
        // close the lightbox at the same time. this way we get no scroll flicker
        var $body = bonzo(document.body);
        $body.removeClass('has-overlay');
        bean.off(document.body, 'keydown', this.handleKeyEvents);
        window.setTimeout(function() {
            if (this.bodyScrollPosition) {
                $body.scrollTop(this.bodyScrollPosition);
            }
            this.$lightboxEl.removeClass('gallery-lightbox--open');
            mediator.emit('ui:images:upgrade');
            mediator.emit('ui:images:vh');
        }.bind(this), 1);
    };

    GalleryLightbox.prototype.pulseButton = function(button) {
        var $btn = bonzo(button);
        $btn.addClass('gallery-lightbox__button-pulse');
        window.setTimeout(function() { $btn.removeClass('gallery-lightbox__button-pulse'); }, 75);
    };

    GalleryLightbox.prototype._handleKeyEvents = function(e) {
        if (e.keyCode === 37) { // left
            this.trigger('prev', 'keyboard');
        } else if (e.keyCode === 39) { // right
            this.trigger('next', 'keyboard');
        } else if (e.keyCode === 27) { // esc
            this.close();
        } else if (e.keyCode === 73) { // 'i'
            this.trigger('toggle-info');
        }
    };

    GalleryLightbox.prototype.loadEndslate = function() {
        if (!this.endslate.rendered) {
            this.endslate.componentClass = 'gallery-lightbox__endslate';
            this.endslate.endpoint = '/gallery/most-viewed.json';
            this.endslate.ready = function () {
                mediator.emit('ui:images:upgrade', this.$contentEl);
            };
            this.endslate.prerender = function() {
                bonzo(this.elem).addClass(this.componentClass);
            };
            this.endslate.fetch(this.$contentEl, 'html');
        }
    };

    GalleryLightbox.prototype.trackInteraction = function (str) {
        mediator.emit('module:clickstream:interaction', str);
    };

    function bootstrap() {
        var lightbox;
        bean.on(document.body, 'click', '.js-gallerythumbs', function(e) {
            e.preventDefault();

            var $el = bonzo(e.currentTarget),
                galleryHref = $el.attr('href') || $el.attr('data-gallery-url'),
                galleryHrefParts = galleryHref.split('?index='),
                parsedGalleryIndex = parseInt(galleryHrefParts[1], 10),
                galleryIndex = isNaN(parsedGalleryIndex) ? 1 : parsedGalleryIndex;// 1-based index
            lightbox = lightbox || new GalleryLightbox();
            lightbox.loadGalleryfromJson(config.page.galleryLightbox, galleryIndex);
        });

        if (config.page.contentType === 'Gallery') {
            lightbox = lightbox || new GalleryLightbox();
            var galleryId = '/' + config.page.pageId,
                match = /\?index=(\d+)/.exec(document.location.href);
            if (match) { // index specified so launch lightbox at that index
                url.pushUrl(null, document.title, galleryId, true); // lets back work properly
                lightbox.loadGalleryfromJson(config.page.galleryLightbox, parseInt(match[1], 10));
            }
        }
    }

    return {
        init: bootstrap,
        GalleryLightbox: GalleryLightbox
    };
});
