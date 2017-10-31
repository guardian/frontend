// @flow
import bean from 'bean';
import bonzo from 'bonzo';
import qwery from 'qwery';
import $ from 'lib/$';
import config from 'lib/config';
import { getBreakpoint, hasTouchScreen, isBreakpoint } from 'lib/detect';
import FiniteStateMachine from 'lib/fsm';
import mediator from 'lib/mediator';
import template from 'lodash/utilities/template';
import { supportsPushState, pushUrl, back as urlBack } from 'lib/url';
import { Component } from 'common/modules/component';
import { inlineSvg } from 'common/views/svgs';
import blockSharingTpl from 'raw-loader!common/views/content/block-sharing.html';
import buttonTpl from 'raw-loader!common/views/content/button.html';
import endslateTpl from 'raw-loader!common/views/content/endslate.html';
import loaderTpl from 'raw-loader!common/views/content/loader.html';
import shareButtonTpl from 'raw-loader!common/views/content/share-button.html';
import shareButtonMobileTpl from 'raw-loader!common/views/content/share-button-mobile.html';
import throttle from 'lodash/functions/throttle';
import { loadCssPromise } from 'lib/load-css-promise';

const pulseButton = (button): void => {
    const $btn = bonzo(button);

    $btn.addClass('gallery-lightbox__button-pulse');

    window.setTimeout(() => {
        $btn.removeClass('gallery-lightbox__button-pulse');
    }, 75);
};

class GalleryLightbox {
    constructor() {
        // CONFIG
        this.showEndslate =
            getBreakpoint() !== 'mobile' &&
            config.page.section !== 'childrens-books-site' &&
            config.page.contentType === 'Gallery';
        this.useSwipe = hasTouchScreen();
        this.swipeThreshold = 0.05;

        // TEMPLATE
        const generateButtonHTML = label => {
            const tmpl = buttonTpl;
            return template(tmpl, {
                label,
            });
        };

        this.galleryLightboxHtml =
            `${'<div class="overlay gallery-lightbox gallery-lightbox--closed gallery-lightbox--hover">' +
                '<div class="gallery-lightbox__sidebar">'}${generateButtonHTML(
                'close'
            )}<div class="gallery-lightbox__progress  gallery-lightbox__progress--sidebar">` +
            `<span class="gallery-lightbox__index js-gallery-index"></span>` +
            `<span class="gallery-lightbox__progress-separator"></span>` +
            `<span class="gallery-lightbox__count js-gallery-count"></span>` +
            `</div>${generateButtonHTML('next')}${generateButtonHTML(
                'prev'
            )}${generateButtonHTML('info-button')}</div>` +
            `<div class="js-gallery-swipe gallery-lightbox__swipe-container">` +
            `<ul class="gallery-lightbox__content js-gallery-content">` +
            `</ul>` +
            `</div>` +
            `</div>`;

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
        this.toggleInfo = e => {
            const infoPanelClick =
                bonzo(e.target).hasClass('js-gallery-lightbox-info') ||
                $.ancestor(e.target, 'js-gallery-lightbox-info');
            if (!infoPanelClick) {
                this.trigger('toggle-info');
            }
        };

        if (hasTouchScreen()) {
            this.disableHover();
        }

        bean.on(window, 'popstate', event => {
            if (!event.state) {
                this.trigger('close');
            }
        });

        // FSM CONFIG
        this.fsm = new FiniteStateMachine({
            initial: 'closed',
            onChangeState(oldState, newState) {
                this.$lightboxEl
                    .removeClass(`gallery-lightbox--${oldState}`)
                    .addClass(`gallery-lightbox--${newState}`);
            },
            context: this,
            states: this.states,
        });
    }

    generateImgHTML(img, i) {
        const blockShortUrl = config.page.shortUrl;
        const urlPrefix = img.src.indexOf('//') === 0 ? 'http:' : '';
        const shareItems = [
            {
                text: 'Facebook',
                css: 'facebook',
                icon: inlineSvg('shareFacebook', ['icon']),
                url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    `${blockShortUrl}/sfb#img-${i}`
                )}`,
            },
            {
                text: 'Twitter',
                css: 'twitter',
                icon: inlineSvg('shareTwitter', ['icon']),
                url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    config.page.webTitle
                )}&url=${encodeURIComponent(`${blockShortUrl}/stw#img-${i}`)}`,
            },
            {
                text: 'Pinterest',
                css: 'pinterest',
                icon: inlineSvg('sharePinterest', ['icon']),
                url: encodeURI(
                    `http://www.pinterest.com/pin/create/button/?description=${config
                        .page
                        .webTitle}&url=${blockShortUrl}&media=${urlPrefix}${img.src}`
                ),
            },
        ];

        return template(blockSharingTpl.replace(/^\s+|\s+$/gm, ''), {
            articleType: 'gallery',
            count: this.images.length,
            index: i,
            caption: img.caption,
            credit: img.displayCredit ? img.credit : '',
            blockShortUrl,
            shareButtons: shareItems
                .map(s => template(shareButtonTpl, s))
                .join(''),
            shareButtonsMobile: shareItems
                .map(s => template(shareButtonMobileTpl, s))
                .join(''),
        });
    }

    initSwipe() {
        let threshold; // time in ms
        let ox;
        let dx;
        const updateTime = 20;

        bean.on(this.$swipeContainer[0], 'touchstart', e => {
            threshold = this.swipeContainerWidth * this.swipeThreshold;
            ox = e.touches[0].pageX;
            dx = 0;
        });

        const touchMove = e => {
            e.preventDefault();
            if (e.touches.length > 1 || (e.scale && e.scale !== 1)) {
                return;
            }
            dx = e.touches[0].pageX - ox;
            this.translateContent(this.index, dx, updateTime);
        };

        bean.on(
            this.$swipeContainer[0],
            'touchmove',
            throttle(touchMove, updateTime, {
                trailing: false,
            })
        );

        bean.on(this.$swipeContainer[0], 'touchend', () => {
            let direction;
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
        });
    }

    disableHover() {
        this.$lightboxEl.removeClass('gallery-lightbox--hover');
    }

    trigger(event, data) {
        this.fsm.trigger(event, data);
    }

    loadGalleryfromJson(galleryJson, startIndex) {
        this.index = startIndex;
        if (this.galleryJson && galleryJson.id === this.galleryJson.id) {
            this.trigger('open');
        } else {
            this.trigger('loadJson', galleryJson);
        }
    }

    loadSurroundingImages(index, count) {
        let imageContent;
        let $img;

        [-1, 0, 1]
            .map(i => (index + i === 0 ? count - 1 : (index - 1 + i) % count))
            .forEach(i => {
                imageContent = this.images[i];
                $img = bonzo(this.$images[i]);
                if (!$img.attr('src')) {
                    $img.parent().append(bonzo.create(loaderTpl));

                    $img.attr('src', imageContent.src);
                    $img.attr('srcset', imageContent.srcsets);
                    $img.attr('sizes', imageContent.sizes);

                    bean.one($img[0], 'load', () => {
                        $('.js-loader').remove();
                    });
                }
            });
    }

    translateContent(imgIndex, offset, duration) {
        const px = -1 * (imgIndex - 1) * this.swipeContainerWidth;
        const contentEl = this.$contentEl[0];

        contentEl.style.webkitTransitionDuration = `${duration}ms`;
        contentEl.style.mozTransitionDuration = `${duration}ms`;
        contentEl.style.msTransitionDuration = `${duration}ms`;
        contentEl.style.transitionDuration = `${duration}ms`;
        contentEl.style.webkitTransform = `translate(${px +
            offset}px,0) translateZ(0)`;
        contentEl.style.mozTransform = `translate(${px + offset}px,0)`;
        contentEl.style.msTransform = `translate(${px + offset}px,0)`;
        contentEl.style.transform = `translate(${px +
            offset}px,0) translateZ(0)`;
    }

    show() {
        const $body = bonzo(document.body);
        this.bodyScrollPosition = $body.scrollTop();
        $body.addClass('has-overlay');
        this.$lightboxEl.addClass('gallery-lightbox--open');
        bean.off(document.body, 'keydown', this.handleKeyEvents); // prevent double binding
        bean.on(document.body, 'keydown', this.handleKeyEvents);
    }

    close() {
        if (hasHistorySupport) {
            urlBack();
        } else {
            this.trigger('close');
        }
        this.trigger('close');
    }

    hide() {
        // remove has-overlay first to show body behind lightbox then scroll and
        // close the lightbox at the same time. this way we get no scroll flicker
        const $body = bonzo(document.body);
        $body.removeClass('has-overlay');
        bean.off(document.body, 'keydown', this.handleKeyEvents);
        window.setTimeout(() => {
            if (this.bodyScrollPosition) {
                $body.scrollTop(this.bodyScrollPosition);
            }
            this.$lightboxEl.removeClass('gallery-lightbox--open');
            mediator.emit('ui:images:vh');
        }, 1);
    }

    handleKeyEvents(e) {
        if (e.keyCode === 37) {
            // left
            this.trigger('prev');
        } else if (e.keyCode === 39) {
            // right
            this.trigger('next');
        } else if (e.keyCode === 38) {
            // up
            this.trigger('show-info');
        } else if (e.keyCode === 40) {
            // down
            this.trigger('hide-info');
        } else if (e.keyCode === 27) {
            // esc
            this.close();
        } else if (e.keyCode === 73) {
            // 'i'
            this.trigger('toggle-info');
        }
    }

    loadEndslate() {
        if (!this.endslate.rendered) {
            this.endslateEl = bonzo.create(endslateTpl);
            this.$contentEl.append(this.endslateEl);

            this.endslate.componentClass = 'gallery-lightbox__endslate';
            this.endslate.endpoint = '/gallery/most-viewed.json';
            this.endslate.prerender = function() {
                bonzo(this.elem).addClass(this.componentClass);
            };
            this.endslate.fetch(
                qwery('.js-gallery-endslate', this.endslateEl),
                'html'
            );
        }
    }
}

GalleryLightbox.prototype.states = {
    closed: {
        enter() {
            this.hide();
        },
        leave() {
            this.show();
            pushUrl({}, document.title, `/${this.galleryJson.id}`);
        },
        events: {
            open() {
                if (this.swipe) {
                    this.swipe.slide(this.index, 0);
                }
                this.state = 'image';
            },
            loadJson(json) {
                this.galleryJson = json;
                this.images = json.images;
                this.$countEl.text(this.images.length);

                const imagesHtml = this.images
                    .map((img, i) => this.generateImgHTML(img, i + 1))
                    .join('');

                this.$contentEl.html(imagesHtml);

                this.$images = $(
                    '.js-gallery-lightbox-img',
                    this.$contentEl[0]
                );

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
            },
        },
    },

    image: {
        enter() {
            this.swipeContainerWidth = this.$swipeContainer.dim().width;

            // load prev/current/next
            this.loadSurroundingImages(this.index, this.images.length);

            this.translateContent(
                this.index,
                0,
                this.useSwipe &&
                isBreakpoint({
                    max: 'tablet',
                })
                    ? 100
                    : 0
            );

            pushUrl(
                {},
                document.title,
                `/${this.galleryJson.id}#img-${this.index}`,
                true
            );

            // event bindings
            bean.on(
                this.$swipeContainer[0],
                'click',
                '.js-gallery-content',
                this.toggleInfo
            );
            mediator.on('window:throttledResize', this.resize);

            // meta
            this.$indexEl.text(this.index);
        },
        leave() {
            bean.off(this.$swipeContainer[0], 'click', this.toggleInfo);
            mediator.off('window:throttledResize', this.resize);
        },
        events: {
            next() {
                pulseButton(this.nextBtn);
                if (this.index === this.images.length) {
                    // last img
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
            prev() {
                pulseButton(this.prevBtn);
                if (this.index === 1) {
                    // first img
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
            reload() {
                this.reloadState = true;
            },
            'toggle-info': function() {
                pulseButton(this.infoBtn);
                this.$lightboxEl.toggleClass('gallery-lightbox--show-info');
            },
            'hide-info': function() {
                pulseButton(this.infoBtn);
                this.$lightboxEl.removeClass('gallery-lightbox--show-info');
            },
            'show-info': function() {
                pulseButton(this.infoBtn);
                this.$lightboxEl.addClass('gallery-lightbox--show-info');
            },
            resize() {
                this.swipeContainerWidth = this.$swipeContainer.dim().width;
                this.loadSurroundingImages(this.index, this.images.length); // regenerate src
                this.translateContent(this.index, 0, 0);
            },
            close() {
                this.state = 'closed';
            },
        },
    },

    endslate: {
        enter() {
            this.translateContent(this.$slides.length, 0, 0);
            this.index = this.images.length + 1;
            mediator.on('window:throttledResize', this.resize);
        },
        leave() {
            mediator.off('window:throttledResize', this.resize);
        },
        events: {
            next() {
                pulseButton(this.nextBtn);
                this.index = 1;
                this.state = 'image';
            },
            prev() {
                pulseButton(this.prevBtn);
                this.index = this.images.length;
                this.state = 'image';
            },
            reload() {
                this.reloadState = true;
            },
            resize() {
                this.swipeContainerWidth = this.$swipeContainer.dim().width;
                this.translateContent(this.$slides.length, 0, 0);
            },
            close() {
                this.state = 'closed';
            },
        },
    },
};

GalleryLightbox.prototype.show = function() {
    const $body = bonzo(document.body);
    this.bodyScrollPosition = $body.scrollTop();
    $body.addClass('has-overlay');
    this.$lightboxEl.addClass('gallery-lightbox--open');
    bean.off(document.body, 'keydown', this.handleKeyEvents); // prevent double binding
    bean.on(document.body, 'keydown', this.handleKeyEvents);
};

GalleryLightbox.prototype.close = function() {
    if (supportsPushState) {
        urlBack();
    } else {
        this.trigger('close');
    }
    this.trigger('close');
};

GalleryLightbox.prototype.hide = function() {
    // remove has-overlay first to show body behind lightbox then scroll and
    // close the lightbox at the same time. this way we get no scroll flicker
    const $body = bonzo(document.body);
    $body.removeClass('has-overlay');
    bean.off(document.body, 'keydown', this.handleKeyEvents);
    window.setTimeout(() => {
        if (this.bodyScrollPosition) {
            $body.scrollTop(this.bodyScrollPosition);
        }

        this.$lightboxEl.removeClass('gallery-lightbox--open');
        mediator.emit('ui:images:vh');
    }, 1);
};

GalleryLightbox.prototype.pulseButton = function(button) {
    const $btn = bonzo(button);
    $btn.addClass('gallery-lightbox__button-pulse');
    window.setTimeout(() => {
        $btn.removeClass('gallery-lightbox__button-pulse');
    }, 75);
};

GalleryLightbox.prototype.handleKeyEvents = function(e) {
    if (e.keyCode === 37) {
        // left
        this.trigger('prev');
    } else if (e.keyCode === 39) {
        // right
        this.trigger('next');
    } else if (e.keyCode === 38) {
        // up
        this.trigger('show-info');
    } else if (e.keyCode === 40) {
        // down
        this.trigger('hide-info');
    } else if (e.keyCode === 27) {
        // esc
        this.close();
    } else if (e.keyCode === 73) {
        // 'i'
        this.trigger('toggle-info');
    }
};

GalleryLightbox.prototype.endslate = new Component();

const bootstrap = () => {
    loadCssPromise.then(() => {
        if (
            'lightboxImages' in config.page &&
            config.page.lightboxImages.images.length > 0
        ) {
            let lightbox;
            const galleryHash = window.location.hash;
            const images = config.page.lightboxImages;
            let res;

            bean.on(document.body, 'click', '.js-gallerythumbs', e => {
                e.preventDefault();

                const $el = bonzo(e.currentTarget);
                const galleryHref =
                    $el.attr('href') || $el.attr('data-gallery-url');
                const galleryHrefParts = galleryHref.split('#img-');
                const parsedGalleryIndex = parseInt(galleryHrefParts[1], 10);
                const galleryIndex = Number.isNaN(parsedGalleryIndex)
                    ? 1
                    : parsedGalleryIndex; // 1-based index
                lightbox = lightbox || new GalleryLightbox();

                lightbox.loadGalleryfromJson(images, galleryIndex);
            });

            lightbox = lightbox || new GalleryLightbox();
            const galleryId = `/${config.page.pageId}`;
            const match = /\?index=(\d+)/.exec(document.location.href);
            if (match) {
                // index specified so launch lightbox at that index
                pushUrl(null, document.title, galleryId, true); // lets back work properly
                lightbox.loadGalleryfromJson(images, parseInt(match[1], 10));
            } else {
                res = /^#(?:img-)?(\d+)$/.exec(galleryHash);
                if (res) {
                    lightbox.loadGalleryfromJson(images, parseInt(res[1], 10));
                }
            }
        }
    });
};

export default {
    init: bootstrap,
    GalleryLightbox,
};
