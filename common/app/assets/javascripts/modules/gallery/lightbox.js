define([
    'common/utils/$',
    'common/utils/_',
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


    var galleryCache = {};

    function GalleryLightbox() {

        // CONFIG
        this.adStep = 4; // advert between every 4th and 5th image
        this.showEndslate = !detect.isBreakpoint('mobile');
        this.showAdverts  = false;

        // TEMPLATE
        function generateButtonHTML(label) {
            var templ = '<div class="gallery-lightbox__btn gallery-lightbox__btn--{{label}} js-gallery-{{label}}">' +
                        '<div class="gallery-lightbox__btn-body"><i></i></div>' +
                    '</div>';
            return templ.replace(/{{label}}/g, label);
        }
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
                '<div class="gallery-lightbox__content js-gallery-content" data-src="">' +
                    '<div class="gallery-lightbox__ad js-gallery-lightbox-ad"></div>' +
                '</div>' +
                '<div class="gallery-lightbox__info">' +
                    '<div class="gallery-lightbox__progress gallery-lightbox__progress--info">' +
                        '<span class="gallery-lightbox__index js-gallery-index"></span>' +
                        '<span class="gallery-lightbox__progress-separator"></span>' +
                        '<span class="gallery-lightbox__count js-gal' +
                '.0lery-count"></span>' +
                    '</div>' +
                    '<div class="gallery-lightbox__img-title js-gallery-img-title"></div>' +
                    '<div class="gallery-lightbox__img-caption js-gallery-img-caption"></div>' +
                    '<div class="gallery-lightbox__img-credit js-gallery-img-credit"></div>' +
                '</div>' +
            '</div>';

        // ELEMENT BINDINGS
        this.lightboxEl = bonzo.create(this.galleryLightboxHtml);
        this.$lightboxEl = bonzo(this.lightboxEl).prependTo(document.body);
        this.$indexEl = $('.js-gallery-index', this.lightboxEl);
        this.$countEl = $('.js-gallery-count', this.lightboxEl);
        this.$contentEl = $('.js-gallery-content', this.lightboxEl);
        this.$imgTitleEl = $('.js-gallery-img-title', this.lightboxEl);
        this.$imgCaptionEl = $('.js-gallery-img-caption', this.lightboxEl);
        this.$imgCreditEl = $('.js-gallery-img-credit', this.lightboxEl);
        this.$advert = $('.js-gallery-lightbox-ad', this.lightboxEl);
        this.nextBtn = qwery('.js-gallery-next', this.lightboxEl)[0];
        this.prevBtn = qwery('.js-gallery-prev', this.lightboxEl)[0];
        this.closeBtn = qwery('.js-gallery-close', this.lightboxEl)[0];
        this.infoBtn = qwery('.js-gallery-info-button', this.lightboxEl)[0];
        bean.on(this.nextBtn, 'click', this.trigger.bind(this, 'next'));
        bean.on(this.prevBtn, 'click', this.trigger.bind(this, 'prev'));
        bean.on(this.closeBtn, 'click', this.close.bind(this));
        bean.on(this.infoBtn, 'click', this.trigger.bind(this, 'toggle-info'));
        bean.one(this.lightboxEl[0], 'touchstart', this.disableHover.bind(this));
        this.handleKeyEvents = this._handleKeyEvents.bind(this); // bound for event handler
        this.toggleInfo = this.trigger.bind(this, 'toggle-info');
        this.resize = this.trigger.bind(this, 'resize');

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

    GalleryLightbox.prototype.disableHover = function() {
        this.$lightboxEl.removeClass('gallery-lightbox--hover');
    };

    GalleryLightbox.prototype.trigger = function(event) {
        this.fsm.trigger(event);
    };

    GalleryLightbox.prototype.fetchGalleryJson = function(galleryId, successCallback, errorCallback) {
        ajax({
            url: galleryId + '/lightbox.json',
            type: 'json',
            method: 'get',
            crossOrigin: true,
            success: successCallback,
            error: errorCallback || function() {}
        });
    };

    GalleryLightbox.prototype.preloadCache = function(galleryId) {
        this.fetchGalleryJson(galleryId, function(response) {
            galleryCache[galleryId] = response.gallery;
        });
    };

    GalleryLightbox.prototype.loadGalleryfromJson = function(galleryJson, startIndex) {
        this.galleryJson = galleryJson;
        this.index = startIndex;
        this.trigger('open');
    };

    GalleryLightbox.prototype.loadGalleryById = function(galleryId, startIndex) {
        this.galleryId = galleryId;
        this.index = startIndex;
        this.trigger('open');
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

    GalleryLightbox.prototype.states = {

        'closed': {
            enter: function() {
                this.hide();
                this.galleryJson = undefined;
                this.galleryId = undefined;
            },
            leave: function() {
                this.show();
            },
            events: {
                'open': function() {
                    this.state = 'loading';
                }
            }
        },

        'loading': {
            enter: function() { // loads gallery from json or id

                if (this.galleryJson) {
                    this.trigger('loadJson');
                }
                else if (this.galleryId in galleryCache) { // json is cached so no need to hit endpoint again
                    this.galleryJson = galleryCache[this.galleryId];
                    this.trigger('loadJson');
                }
                else if (this.galleryId) {
                    this.fetchGalleryJson(this.galleryId, function (response) {
                        this.galleryJson = galleryCache[this.galleryId] = response.gallery;
                        this.trigger('loadJson');
                    }.bind(this));
                }
                else {
                    throw 'Gallery lightbox opened with no gallery json/id';
                }

            },
            leave: function() {
                url.pushUrl({}, document.title, '/' + this.galleryJson.id);
            },
            events: {
                'loadJson': function() {
                    this.imgCount = this.galleryJson.images.length;
                    this.$countEl.text(this.imgCount + (this.showEndslate ? 1 : 0));
                    this.state = 'image';
                }
            }
        },

        'image': {
            enter: function() {
                url.pushUrl({}, document.title, '/' + this.galleryJson.id + '?index=' + this.index, true);

                this.$lightboxEl.addClass('gallery-lightbox--loading-img');

                // create image and append to lightbox
                var img = this.galleryJson.images[this.index - 1],
                    imgHtml = '<img class="gallery-lightbox__img" src="' + this.getImgSrc(img) + '"/>';
                this.imgEl = bonzo.create(imgHtml)[0];
                this.$contentEl.append(this.imgEl);

                // event bindings
                bean.on(this.imgEl, 'load', this.trigger.bind(this, 'loaded'));
                bean.on(this.$contentEl[0], 'click', this.toggleInfo);
                mediator.on('window:resize', this.resize);

                // meta
                this.$indexEl.text(this.index);
                this.$imgTitleEl.text(img.title);
                this.$imgCaptionEl.html(img.caption);
                this.$imgCreditEl.text(img.displayCredit ? img.credit : '');

                // preload next image if we aren't at the end
                if (this.index < this.imgCount) {
                    var nextImg = this.galleryJson.images[this.index],
                        nextImgHtml = '<img class="gallery-lightbox__preload-img" src="' + this.getImgSrc(nextImg) + '"/>';
                    this.preloadImgEl = bonzo.create(nextImgHtml)[0];
                    this.$contentEl.append(this.preloadImgEl);
                }

                if(this.index > (this.imgCount - 3)) {
                    this.loadEndslate();
                }
            },
            leave: function() {
                bonzo(this.imgEl).remove();
                bonzo(this.preloadImgEl).remove();
                bean.off(this.$contentEl[0], 'click', this.toggleInfo);
                mediator.off('window:resize', this.resize);
                this.imgEl = undefined;
            },
            events: {
                'next': function() {
                    this.trackInteraction('keyboard:next');
                    this.pulseButton(this.nextBtn);
                    if (this.index === this.imgCount) { // last img
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
                'prev': function() {
                    this.trackInteraction('keyboard:previous');
                    this.pulseButton(this.prevBtn);
                    if (this.index === 1) { // first img
                        if (this.showEndslate) {
                            this.state = 'endslate';
                        } else {
                            this.index = this.imgCount;
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
                    var imgSrc = this.getImgSrc(this.galleryJson.images[this.index - 1]);
                    bonzo(this.imgEl).attr('src', imgSrc);
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
                'next': function() {
                    this.pulseButton(this.nextBtn);
                    this.index = (this.adIndex * this.adStep) + 1;
                    this.state = 'image';
                },
                'prev': function() {
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
                this.endslate.removeState('is-hidden');
                this.$indexEl.text(this.imgCount + 1);
            },
            leave: function() {
                this.endslate.setState('is-hidden');
            },
            events: {
                'next': function() {
                    this.pulseButton(this.nextBtn);
                    this.index = 1;
                    this.state = 'image';
                },
                'prev': function() {
                    this.pulseButton(this.prevBtn);
                    this.index = this.imgCount;
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
            this.trigger('prev');
        } else if (e.keyCode === 39) { // right
            this.trigger('next');
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

    function bootstrap(config) {
        var lightbox;
        bean.on(document.body, 'click', '.js-gallerythumbs', function(e) {
            e.preventDefault();

            var $el = bonzo(e.currentTarget),
                galleryHref = $el.attr('href') || $el.attr('data-gallery-url'),
                galleryHrefParts = galleryHref.split('?index='),
                galleryId = galleryHrefParts[0],
                parsedGalleryIndex = parseInt(galleryHrefParts[1], 10),
                galleryIndex = isNaN(parsedGalleryIndex) ? 1 : parsedGalleryIndex;// 1-based index
            lightbox = lightbox || new GalleryLightbox();
            lightbox.loadGalleryById(galleryId, galleryIndex);
        });

        if (config.page.contentType === 'Gallery') {
            lightbox = lightbox || new GalleryLightbox();
            var galleryId = '/' + config.page.pageId,
                match = /\?index=(\d+)/.exec(document.location.href);
            if (match) { // index specified so launch lightbox at that index
                url.pushUrl(null, document.title, galleryId, true); // lets back work properly
                lightbox.loadGalleryById(galleryId, parseInt(match[1], 10));
            } else { // preload gallery json
                lightbox.preloadCache(galleryId);
            }

        }
    }

    return {
        init: bootstrap,
        GalleryLightbox: GalleryLightbox
    };
});
