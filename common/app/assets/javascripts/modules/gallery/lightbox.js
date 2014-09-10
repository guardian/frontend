define([
    'common/utils/$',
    'bean',
    'common/utils/mediator',
    'bonzo',
    'qwery',
    'common/utils/ajax',
    'common/utils/fsm',
    'common/utils/detect',
    'common/modules/component'
], function (
    $,
    bean,
    mediator,
    bonzo,
    qwery,
    ajax,
    FiniteStateMachine,
    detect,
    Component
) {

    var galleryCache = {};

    function GalleryLightbox() {

        // CONFIG
        this.adStep = 4; // advert between every 4th and 5th image
        this.showEndslate = !detect.isBreakpoint('mobile');
        this.showAdverts  = false;

        // TEMPLATE
        this.galleryLightboxHtml =
            '<div class="overlay gallery-lightbox">' +
                '<div class="pamplemousse gallery-lightbox__loader">' +
                    '<div class="pamplemousse__pip"><i></i></div>' +
                    '<div class="pamplemousse__pip"><i></i></div>' +
                    '<div class="pamplemousse__pip"><i></i></div>' +
                '</div>' +
                '<div class="gallery-lightbox__sidebar">' +
                    '<div class="gallery-lightbox__close js-gallery-close"><i></i></div>' +
                    '<div class="gallery-lightbox__progress  gallery-lightbox__progress--sidebar">' +
                        '<span class="gallery-lightbox__index js-gallery-index"></span>' +
                        '<span class="gallery-lightbox__progress-separator"></span>' +
                        '<span class="gallery-lightbox__count js-gallery-count"></span>' +
                    '</div>' +
                    '<div class="gallery-lightbox__next js-gallery-next"><i></i></div>' +
                    '<div class="gallery-lightbox__prev js-gallery-prev"><i></i></div>' +
                    '<div class="gallery-lightbox__info-button js-gallery-info-button"><i></i></div>' +
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
        bean.on(this.closeBtn, 'click', this.trigger.bind(this, 'close'));
        bean.on(this.infoBtn, 'click', this.trigger.bind(this, 'toggle-info'));
        this.handleKeyEvents = this._handleKeyEvents.bind(this); // bound for event handler
        this.toggleInfo = this.trigger.bind(this, 'toggle-info');

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

    GalleryLightbox.prototype.trigger = function(event) {
        this.fsm.trigger(event);
    };

    GalleryLightbox.prototype.states = {

        'closed': {
            enter: function() {
                this.hide();
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
                else {
                    var self = this; // :(
                    ajax({
                        url: this.galleryId + '/lightbox.json',
                        type: 'json',
                        method: 'get',
                        crossOrigin: true,
                        success: function (response) {
                            self.galleryJson = response.gallery;
                            self.trigger('loadJson');
                        },
                        error: function () {
                            // TODO: error message
                        }
                    });
                }
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
                this.$lightboxEl.addClass('gallery-lightbox--loading-img');
                var img = this.galleryJson.images[this.index - 1];
                this.imgEl = bonzo.create('<img class="gallery-lightbox__img responsive-img"/>')[0];
                this.$contentEl.append(this.imgEl);
                bean.on(this.imgEl, 'load', this.trigger.bind(this, 'loaded'));
                bean.on(this.$contentEl[0], 'click', this.toggleInfo);

                this.$indexEl.text(this.index);
                this.$imgTitleEl.text(img.title);
                this.$contentEl.attr('data-src', img.src);
                this.$imgCaptionEl.html(img.caption);
                this.$imgCreditEl.text(img.displayCredit ? img.credit : '');

                this.$contentEl.addClass('js-image-upgrade');
                mediator.emit('ui:images:upgrade', this.lightboxEl);

                if(this.index > (this.imgCount - 3) && !this.endslate) {
                    this.loadEndslate();
                }
            },
            leave: function() {
                bonzo(this.imgEl).remove();
                bean.off(this.$contentEl[0], 'click', this.toggleInfo);
                this.imgEl = undefined;
                this.$contentEl.removeClass('js-image-upgrade');
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
                    this.pulseButton(this.nextBtn);
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
                    if (!this.$lightboxEl.hasClass('gallery-lightbox--show-info')) {
                        window.setTimeout(function() {
                            mediator.emit('ui:images:upgrade');
                        }, 100);
                    }
                },
                'loaded': function() {
                    this.$lightboxEl.removeClass('gallery-lightbox--loading-img');
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

    GalleryLightbox.prototype.loadGalleryById = function(galleryId, startIndex) {
        this.galleryId = galleryId;
        this.index = startIndex;
        this.trigger('open');
    };

    GalleryLightbox.prototype.preloadImage = function() {
    };

    GalleryLightbox.prototype.show = function() {
        var $body = bonzo(document.body);
        this.bodyScrollPosition = $body.scrollTop();
        $body.addClass('has-overlay');
        this.$lightboxEl.addClass('gallery-lightbox--open');
        bean.off(document.body, 'keydown', this.handleKeyEvents); // prevent double binding
        bean.on(document.body, 'keydown', this.handleKeyEvents);
    };

    GalleryLightbox.prototype.hide = function() {
        // remove has-overlay first to show body behind lightbox then scroll and
        // close the lightbox at the same time. this way we get no scroll flicker
        var $body = bonzo(document.body);
        $body.removeClass('has-overlay');
        bean.off(document.body, 'keydown', this.handleKeyEvents);
        window.setTimeout(function() {
            $body.scrollTop(this.bodyScrollPosition);
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
            this.trigger('close');
        } else if (e.keyCode === 73) { // 'i'
            this.trigger('toggle-info');
        }
    };

    GalleryLightbox.prototype.loadEndslate = function() {
        this.endslate = new Component();

        this.endslate.componentClass = 'gallery-lightbox__endslate';
        this.endslate.endpoint = '/gallery/most-viewed.json';
        this.endslate.ready = function () {
            mediator.emit('ui:images:upgrade', this.$contentEl);
        };
        this.endslate.prerender = function() {
            bonzo(this.elem).addClass(this.componentClass);
            this.setState('is-hidden');
        }
        this.endslate.fetch(this.$contentEl, 'html');
    };

    GalleryLightbox.prototype.trackInteraction = function (str) {
        mediator.emit('module:clickstream:interaction', str);
    };

    function bootstrap(/*config*/) {
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
    }

    return {
        init: bootstrap
    };
});
