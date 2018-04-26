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
import throttle from 'lodash/functions/throttle';
import { loadCssPromise } from 'lib/load-css-promise';

type ImageJson = {
    caption: string,
    credit: string,
    displayCredit: string,
    ratio: number,
    role: string,
    sizes: string,
    src: string,
    srcsets: string,
};

type GalleryJson = {
    id: string,
    headline: string,
    shouldHideAdverts: boolean,
    standfirst: string,
    images: Array<ImageJson>,
};

const pulseButton = (button: HTMLElement): void => {
    const $btn: bonzo = bonzo(button);
    $btn.addClass('gallery-lightbox__button-pulse');

    window.setTimeout(() => {
        $btn.removeClass('gallery-lightbox__button-pulse');
    }, 75);
};

class Endslate extends Component {
    prerender(): void {
        bonzo(this.elem).addClass(this.componentClass);
    }
}

class GalleryLightbox {
    showEndslate: boolean;
    useSwipe: boolean;
    swipeThreshold: number;
    lightboxEl: bonzo;
    $lightboxEl: bonzo;
    $indexEl: bonzo;
    $countEl: bonzo;
    $contentEl: bonzo;
    nextBtn: HTMLElement;
    prevBtn: HTMLElement;
    closeBtn: HTMLElement;
    infoBtn: HTMLElement;
    $swipeContainer: bonzo;
    handleKeyEvents: Function;
    resize: Function;
    toggleInfo: Function;
    fsm: FiniteStateMachine;
    states: Object;
    images: Array<ImageJson>;
    swipeContainerWidth: number;
    $slides: bonzo;
    index: number;
    $images: bonzo;
    galleryJson: GalleryJson;
    bodyScrollPosition: number;
    endslateEl: bonzo;
    endslate: Object;

    constructor(): void {
        // CONFIG
        this.showEndslate =
            getBreakpoint() !== 'mobile' &&
            config.get('page.section') !== 'childrens-books-site' &&
            config.get('page.contentType') === 'Gallery';
        this.useSwipe = hasTouchScreen();
        this.swipeThreshold = 0.05;

        // TEMPLATE
        const generateButtonHTML = (label: string): string => {
            const tmpl: string = buttonTpl;
            return template(tmpl, {
                label,
            });
        };

        const galleryLightboxHtml: string = `<div class="overlay gallery-lightbox gallery-lightbox--closed gallery-lightbox--hover">
                <div class="gallery-lightbox__sidebar">
                    ${generateButtonHTML('close')}
                    <div class="gallery-lightbox__progress  gallery-lightbox__progress--sidebar">
                        <span class="gallery-lightbox__index js-gallery-index"></span>
                        <span class="gallery-lightbox__progress-separator"></span>
                        <span class="gallery-lightbox__count js-gallery-count"></span>
                    </div>
                    ${generateButtonHTML('next')}
                    ${generateButtonHTML('prev')}
                    ${generateButtonHTML('info-button')}
                </div>
                <div class="js-gallery-swipe gallery-lightbox__swipe-container">
                    <ul class="gallery-lightbox__content js-gallery-content"></ul>
                </div>
            </div>`;

        // ELEMENT BINDINGS
        this.lightboxEl = bonzo.create(galleryLightboxHtml);
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
        bean.on(this.infoBtn, 'click', this.trigger.bind(this, 'toggleInfo'));
        this.handleKeyEvents = this.handleKeyEvents.bind(this); // bound for event handler
        this.resize = this.trigger.bind(this, 'resize');
        this.toggleInfo = (e): void => {
            const infoPanelClick =
                bonzo(e.target).hasClass('js-gallery-lightbox-info') ||
                $.ancestor(e.target, 'js-gallery-lightbox-info');

            if (!infoPanelClick) {
                this.trigger('toggleInfo');
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
            onChangeState(oldState: string, newState: string): void {
                this.$lightboxEl
                    .removeClass(`gallery-lightbox--${oldState}`)
                    .addClass(`gallery-lightbox--${newState}`);
            },
            context: this,
            states: this.states,
        });
    }

    generateImgHTML(img: Object, i: number): string {
        const blockShortUrl = config.get('page.shortUrl');
        const urlPrefix = img.src.startsWith('//') ? 'http:' : '';
        const shareItems: Array<{
            text: string,
            css: string,
            icon: string,
            url: string,
        }> = [
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
                    config.get('page.webTitle')
                )}&url=${encodeURIComponent(`${blockShortUrl}/stw#img-${i}`)}`,
            },
            {
                text: 'Pinterest',
                css: 'pinterest',
                icon: inlineSvg('sharePinterest', ['icon']),
                url: encodeURI(
                    `http://www.pinterest.com/pin/create/button/?description=${config.get(
                        'page.webTitle'
                    )}&url=${blockShortUrl}&media=${urlPrefix}${img.src}`
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
        });
    }

    initSwipe(): void {
        let threshold; // time in ms
        let ox;
        let dx;
        const updateTime = 20;

        bean.on(
            this.$swipeContainer[0],
            'touchstart',
            (e: TouchEvent): void => {
                threshold = this.swipeContainerWidth * this.swipeThreshold;
                ox = e.touches[0].pageX;
                dx = 0;
            }
        );

        const touchMove = (e: TouchEvent): void => {
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

        bean.on(this.$swipeContainer[0], 'touchend', (): void => {
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

    disableHover(): void {
        this.$lightboxEl.removeClass('gallery-lightbox--hover');
    }

    trigger(event: string, data?: GalleryJson): void {
        this.fsm.trigger(event, data);
    }

    loadGalleryfromJson(galleryJson: GalleryJson, startIndex: number): void {
        this.index = startIndex;

        if (this.galleryJson && galleryJson.id === this.galleryJson.id) {
            this.trigger('open');
        } else {
            this.trigger('loadJson', galleryJson);
        }
    }

    loadSurroundingImages(index: number, count: number): void {
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

    translateContent(imgIndex: number, offset: number, duration: number): void {
        const px = -1 * (imgIndex - 1) * this.swipeContainerWidth;
        const contentEl = this.$contentEl[0];

        Object.assign(contentEl.style, {
            webkitTransitionDuration: `${duration}ms`,
            mozTransitionDuration: `${duration}ms`,
            msTransitionDuration: `${duration}ms`,
            transitionDuration: `${duration}ms`,
            webkitTransform: `translate(${px + offset}px,0) translateZ(0)`,
            mozTransform: `translate(${px + offset}px,0)`,
            msTransform: `translate(${px + offset}px,0)`,
            transform: `translate(${px + offset}px,0) translateZ(0)`,
        });
    }

    show(): void {
        const $body = bonzo(document.body);
        this.bodyScrollPosition = $body.scrollTop();
        $body.addClass('has-overlay');
        this.$lightboxEl.addClass('gallery-lightbox--open');
        bean.off(document.body, 'keydown', this.handleKeyEvents); // prevent double binding
        bean.on(document.body, 'keydown', this.handleKeyEvents);
    }

    close(): void {
        if (supportsPushState) {
            urlBack();
        } else {
            this.trigger('close');
        }
        this.trigger('close');
    }

    hide(): void {
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

    handleKeyEvents(e: KeyboardEvent): void {
        if (e.keyCode === 37) {
            // left
            this.trigger('prev');
        } else if (e.keyCode === 39) {
            // right
            this.trigger('next');
        } else if (e.keyCode === 38) {
            // up
            this.trigger('showInfo');
        } else if (e.keyCode === 40) {
            // down
            this.trigger('hideInfo');
        } else if (e.keyCode === 27) {
            // esc
            this.close();
        } else if (e.keyCode === 73) {
            // 'i'
            this.trigger('toggleInfo');
        }
    }

    endslate = new Endslate();

    loadEndslate(): void {
        if (!this.endslate.rendered && this.$contentEl) {
            this.endslateEl = bonzo.create(endslateTpl);
            this.$contentEl.append(this.endslateEl);

            this.endslate.componentClass = 'gallery-lightbox__endslate';
            this.endslate.endpoint = '/gallery/most-viewed.json';

            this.endslate.fetch(
                qwery('.js-gallery-endslate', this.endslateEl),
                'html'
            );
        }
    }

    states = {
        closed: {
            enter(): void {
                this.hide();
            },
            leave(): void {
                this.show();
                pushUrl({}, document.title, `/${this.galleryJson.id}`);
            },
            events: {
                open(): void {
                    if (this.swipe) {
                        this.swipe.slide(this.index, 0);
                    }
                    this.state = 'image';
                },
                loadJson(json: GalleryJson): void {
                    this.galleryJson = json;
                    this.images = json.images || [];
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
                        $(
                            '.gallery-lightbox__progress',
                            this.lightboxEl
                        ).hide();
                    }

                    this.state = 'image';
                },
            },
        },

        image: {
            enter(): void {
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
            leave(): void {
                bean.off(this.$swipeContainer[0], 'click', this.toggleInfo);
                mediator.off('window:throttledResize', this.resize);
            },
            events: {
                next(): void {
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
                prev(): void {
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
                reload(): void {
                    this.reloadState = true;
                },
                toggleInfo(): void {
                    pulseButton(this.infoBtn);
                    this.$lightboxEl.toggleClass('gallery-lightbox--show-info');
                },
                hideInfo(): void {
                    pulseButton(this.infoBtn);
                    this.$lightboxEl.removeClass('gallery-lightbox--show-info');
                },
                showInfo(): void {
                    pulseButton(this.infoBtn);
                    this.$lightboxEl.addClass('gallery-lightbox--show-info');
                },
                resize(): void {
                    this.swipeContainerWidth = this.$swipeContainer.dim().width;
                    this.loadSurroundingImages(this.index, this.images.length); // regenerate src
                    this.translateContent(this.index, 0, 0);
                },
                close(): void {
                    this.state = 'closed';
                },
            },
        },

        endslate: {
            enter(): void {
                this.translateContent(this.$slides.length, 0, 0);
                this.index = this.images.length + 1;
                mediator.on('window:throttledResize', this.resize);
            },
            leave(): void {
                mediator.off('window:throttledResize', this.resize);
            },
            events: {
                next(): void {
                    pulseButton(this.nextBtn);
                    this.index = 1;
                    this.state = 'image';
                },
                prev(): void {
                    pulseButton(this.prevBtn);
                    this.index = this.images.length;
                    this.state = 'image';
                },
                reload(): void {
                    this.reloadState = true;
                },
                resize(): void {
                    this.swipeContainerWidth = this.$swipeContainer.dim().width;
                    this.translateContent(this.$slides.length, 0, 0);
                },
                close(): void {
                    this.state = 'closed';
                },
            },
        },
    };
}

const init = (): void => {
    loadCssPromise.then(() => {
        const images = config.get('page.lightboxImages');

        if (images && images.images.length > 0) {
            let lightbox;
            const galleryHash = window.location.hash;

            let res;

            bean.on(document.body, 'click', '.js-gallerythumbs', (e: Event) => {
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
            const galleryId = `/${config.get('page.pageId')}`;
            const match = /\?index=(\d+)/.exec(document.location.href);

            if (match) {
                // index specified so launch lightbox at that index
                pushUrl({}, document.title, galleryId, true); // lets back work properly
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

export { init };
export const _ = { GalleryLightbox };
