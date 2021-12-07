import fastdom from 'fastdom';
import { throttle } from 'lodash-es';
import config from '../../../../lib/config';
import { getBreakpoint, hasTouchScreen } from '../../../../lib/detect';
import { FiniteStateMachine } from '../../../../lib/fsm';
import { loadCssPromise } from '../../../../lib/load-css-promise';
import { mediator } from '../../../../lib/mediator';
import { pushUrl } from '../../../../lib/url';
import interactionTracking from '../../../common/modules/analytics/interaction-tracking';

class HostedGallery {
	constructor() {
		// CONFIG
		const breakpoint = getBreakpoint();
		this.useSwipe =
			hasTouchScreen() &&
			(breakpoint === 'mobile' || breakpoint === 'tablet');
		this.swipeThreshold = 0.05;
		this.index = this.index || 1;
		this.imageRatios = [];

		// ELEMENT BINDINGS
		this.$galleryEl = document.querySelector(
			'.js-hosted-gallery-container',
		);
		this.$galleryFrame = document.querySelector('.js-hosted-gallery-frame');
		this.$header = document.querySelector('.js-hosted-headerwrap');
		this.$imagesContainer = this.$galleryEl.querySelector(
			'.js-hosted-gallery-images',
		);
		this.$captionContainer = document.querySelector(
			'.js-gallery-caption-bar',
		);
		this.$captions = [
			...this.$captionContainer.querySelectorAll(
				'.js-hosted-gallery-caption',
			),
		];
		this.$scrollEl = this.$galleryEl.querySelector(
			'.js-hosted-gallery-scroll-container',
		);

		this.$images = [
			...this.$imagesContainer.querySelectorAll(
				'.js-hosted-gallery-image',
			),
		];
		this.$progress = this.$galleryEl.querySelector(
			'.js-hosted-gallery-progress',
		);
		this.$border = this.$progress.querySelector(
			'.js-hosted-gallery-rotating-border',
		);
		this.prevBtn = this.$progress.querySelector('.inline-arrow-up');
		this.nextBtn = this.$progress.querySelector('.inline-arrow-down');
		this.infoBtn = this.$captionContainer.querySelector(
			'.js-gallery-caption-button',
		);
		this.$counter = this.$progress.querySelector(
			'.js-hosted-gallery-image-count',
		);
		this.$ctaFloat = this.$galleryEl.querySelector(
			'.js-hosted-gallery-cta',
		);
		this.$ojFloat = this.$galleryEl.querySelector('.js-hosted-gallery-oj');
		this.$meta = this.$galleryEl.querySelector('.js-hosted-gallery-meta');
		this.ojClose = this.$ojFloat.querySelector(
			'.js-hosted-gallery-oj-close',
		);

		if (this.$galleryEl) {
			this.resize = this.trigger.bind(this, 'resize');
			mediator.on('window:throttledResize', this.resize);

			// FSM CONFIG
			this.fsm = new FiniteStateMachine({
				initial: 'image',
				onChangeState() {},
				context: this,

				states: this.states,
			});

			this.infoBtn.addEventListener(
				'click',
				this.trigger.bind(this, 'toggle-info'),
			);
			this.ojClose.addEventListener('click', this.toggleOj.bind(this));

			if (document.body) {
				document.body.addEventListener(
					'keydown',
					this.handleKeyEvents.bind(this),
				);
			}
			this.loadSurroundingImages(1, this.$images.length);
			this.setPageWidth();

			if (this.useSwipe) {
				this.$galleryEl.classList.add('use-swipe');
				this.initSwipe();
			} else {
				this.$galleryEl.classList.add('use-scroll');
				this.initScroll();
			}
		}
	}

	toggleOj() {
		this.$ojFloat.classList.toggle('minimise-oj');
	}

	toggleClass(el, className, opt_condition) {
		if (el) {
			typeof opt_condition !== 'undefined'
				? opt_condition
					? el.classList.add(className)
					: el.classList.remove(className)
				: el.toggleClass(className);
		}
	}

	initScroll() {
		this.nextBtn.addEventListener('click', () => {
			this.scrollTo(this.index + 1);
			if (this.index < this.$images.length) {
				this.trigger('next', {
					nav: 'Click',
				});
			} else {
				this.trigger('reload');
			}
		});
		this.prevBtn.addEventListener('click', () => {
			this.scrollTo(this.index - 1);
			if (this.index > 1) {
				this.trigger('prev', {
					nav: 'Click',
				});
			} else {
				this.trigger('reload');
			}
		});

		this.$scrollEl.addEventListener(
			'scroll',
			throttle(this.fadeContent.bind(this), 20),
		);
	}

	initSwipe() {
		let threshold; // time in ms
		let ox;
		let dx;
		const updateTime = 20;
		this.$imagesContainer.style.setProperty(
			'width',
			`${this.$images.length}00%`,
		);

		this.$galleryEl.addEventListener('touchstart', (e) => {
			threshold = this.swipeContainerWidth * this.swipeThreshold;
			ox = e.touches[0].pageX;
			dx = 0;
		});

		const touchMove = (e) => {
			e.preventDefault();
			if (e.touches.length > 1 || (e.scale && e.scale !== 1)) {
				return;
			}
			dx = e.touches[0].pageX - ox;
			this.translateContent(this.index, dx, updateTime);
		};

		this.$galleryEl.addEventListener(
			'touchmove',
			throttle(touchMove, updateTime, {
				trailing: false,
			}),
		);

		this.$galleryEl.addEventListener('touchend', () => {
			let direction;
			if (Math.abs(dx) > threshold) {
				direction = dx > threshold ? 1 : -1;
			} else {
				direction = 0;
			}
			dx = 0;

			if (direction === 1) {
				if (this.index > 1) {
					this.trigger('prev', {
						nav: 'Swipe',
					});
				} else {
					this.trigger('reload');
				}
			} else if (direction === -1) {
				if (this.index < this.$images.length) {
					this.trigger('next', {
						nav: 'Swipe',
					});
				} else {
					this.trigger('reload');
				}
			} else {
				this.trigger('reload');
			}
		});
	}

	static ctaIndex() {
		const ctaIndex = config.get('page.ctaIndex');
		const images = config.get('page.images');
		return ctaIndex > 0 && ctaIndex < images.length - 1
			? ctaIndex
			: undefined;
	}

	trigger(event, data) {
		this.fsm.trigger(event, data);
	}

	loadSurroundingImages(index, count) {
		let $img;
		const that = this;

		const setSize = ($image, imageIndex) => {
			if (!that.imageRatios[imageIndex]) {
				that.imageRatios[imageIndex] =
					$image.naturalWidth / $image.naturalHeight;
			}
			that.resizeImage.call(that, imageIndex);
		};

		[0, 1, 2]
			.map((i) => (index + i === 0 ? count - 1 : (index - 1 + i) % count))
			.forEach(function (i) {
				$img = this.$images[i].querySelector('img');
				if (!$img.complete) {
					$img.addEventListener('load', setSize.bind(this, $img, i));
				} else {
					setSize($img, i);
				}
			}, this);
	}

	resizeImage(imgIndex) {
		const $galleryFrame = this.$galleryFrame;
		const width = $galleryFrame.clientWidth;
		const height = $galleryFrame.clientHeight;

		const getFrame = (desiredRatio, w = width, h = height) => {
			const frame = {
				height: h,
				width: w,
				topBottom: 0,
				leftRight: 0,
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
		};

		const $imageDiv = this.$images[imgIndex];
		const $ctaFloat = this.$ctaFloat;
		const $ojFloat = this.$ojFloat;
		const $meta = this.$meta;
		const $images = this.$images;
		const $sizer = $imageDiv.querySelector(
			'.js-hosted-gallery-image-sizer',
		);
		const imgRatio = this.imageRatios[imgIndex];
		const ctaSize = getFrame(0);
		const ctaIndex = HostedGallery.ctaIndex();
		const tabletSize = 740;
		const imageSize = getFrame(imgRatio);

		fastdom.mutate(() => {
			if ($sizer) {
				$sizer.style.setProperty('width', imageSize.width);
				$sizer.style.setProperty('height', imageSize.height);
				$sizer.style.setProperty('top', imageSize.topBottom);
				$sizer.style.setProperty('left', imageSize.leftRight);
			}
			if (imgIndex === ctaIndex) {
				$ctaFloat.style.setProperty('bottom', ctaSize.topBottom);
			}
			if (imgIndex === $images.length - 1) {
				$ojFloat.style.setProperty('bottom', ctaSize.topBottom);
			}
			if (imgIndex === $images.length - 1) {
				$ojFloat.style.setProperty(
					'padding-bottom',
					ctaSize.topBottom > 40 || width > tabletSize ? 0 : 40,
				);
			}
			if (imgIndex === 0) {
				$meta.style.setProperty(
					'padding-bottom',
					imageSize.topBottom > 40 || width > tabletSize ? 20 : 40,
				);
			}
		});
	}

	translateContent(imgIndex, offset, duration) {
		const px = -1 * (imgIndex - 1) * this.swipeContainerWidth;
		const galleryEl = this.$imagesContainer;
		const $meta = this.$meta;

		fastdom.mutate(() => {
			galleryEl.style.setProperty('transition-duration', `${duration}ms`);
			galleryEl.style.setProperty(
				'transform',
				`translate(${px + offset}px,0) translateZ(0)`,
			);
			$meta.style.setProperty('opacity', offset !== 0 ? 0 : 1);
		});
	}

	fadeContent(e) {
		const length = this.$images.length;
		const scrollTop =
			e.target instanceof HTMLElement ? e.target.scrollTop : 0;
		const scrollHeight =
			e.target instanceof HTMLElement ? e.target.scrollHeight : 0;
		const progress =
			Math.round(length * (scrollTop / scrollHeight) * 100) / 100;
		const fractionProgress = progress % 1;
		const deg = Math.ceil(fractionProgress * 360);
		const newIndex = Math.round(progress + 0.75);
		const ctaIndex = HostedGallery.ctaIndex() || -1;
		fastdom.mutate(() => {
			this.$images.forEach((image, index) => {
				const opacity = ((progress - index + 1) * 16) / 11 - 0.0625;
				image.style.setProperty(
					'opacity',
					Math.min(Math.max(opacity, 0), 1),
				);
			});

			this.$border.style.setProperty('transform', `rotate(${deg}deg)`);

			this.toggleClass(
				this.$galleryEl,
				'show-cta',
				progress <= ctaIndex && progress >= ctaIndex - 0.25,
			);

			this.toggleClass(
				this.$galleryEl,
				'show-oj',
				progress >= length - 1.25,
			);

			this.toggleClass(
				this.$progress,
				'first-half',
				fractionProgress && fractionProgress < 0.5,
			);

			this.$meta.style.setProperty('opacity', progress !== 0 ? 0 : 1);
		});

		if (newIndex && newIndex !== this.index) {
			this.index = newIndex;
			this.trigger('reload', {
				nav: 'Scroll',
			});
		}
	}

	scrollTo(index) {
		const scrollEl = this.$scrollEl;
		const length = this.$images.length;
		const scrollHeight = scrollEl.scrollHeight;
		fastdom.mutate(() => {
			scrollEl.scrollTop = ((index - 1) * scrollHeight) / length;
		});
	}

	trackNavBetweenImages(data) {
		if (data && data.nav) {
			const trackingPrefix = config.get('page.trackingPrefix', '');
			interactionTracking.trackNonClickInteraction(
				`${trackingPrefix + data.nav} - image ${this.index}`,
			);
		}
	}

	onResize() {
		this.resizer =
			this.resizer ||
			(() => {
				this.loadSurroundingImages(this.index, this.$images.length);
				if (this.useSwipe) {
					this.swipeContainerWidth = this.$galleryFrame.offsetWidth;
					this.translateContent(this.index, 0, 0);
				}
				this.setPageWidth();
			});
		throttle(this.resizer, 200)();
	}

	setPageWidth() {
		const $imagesContainer = this.$imagesContainer;
		const $gallery = this.$galleryEl;
		const width = $gallery.clientWidth;
		const height = $imagesContainer.clientHeight;
		const $header = this.$header;
		const $footer = this.$captionContainer;
		const $galleryFrame = this.$galleryFrame;
		const imgRatio = 5 / 3;
		let imageWidth = width;
		let leftRight = 0;
		const that = this;
		if (imgRatio < width / height) {
			imageWidth = height * imgRatio;
			leftRight = `${(width - imageWidth) / 2}px`;
		}
		this.swipeContainerWidth = imageWidth;
		fastdom.mutate(() => {
			if ($header) {
				$header.style.setProperty('width', imageWidth);
			}
			if ($footer) {
				$footer.style.setProperty('margin', `0 ${leftRight}`);
				$footer.style.setProperty('width', 'auto');
			}
			if ($gallery) {
				$galleryFrame.style.setProperty('left', leftRight);
				$galleryFrame.style.setProperty('right', leftRight);
			}
			that.loadSurroundingImages(that.index, that.$images.length);
		});
	}

	handleKeyEvents(e) {
		const keyNames = {
			37: 'left',
			38: 'up',
			39: 'right',
			40: 'down',
		};
		if (e.keyCode === 37 || e.keyCode === 38) {
			// up/left
			e.preventDefault();
			this.scrollTo(this.index - 1);
			this.trigger('prev', {
				nav: `KeyPress:${keyNames[e.keyCode]}`,
			});
			return false;
		} else if (e.keyCode === 39 || e.keyCode === 40) {
			// down/right
			e.preventDefault();
			this.scrollTo(this.index + 1);
			this.trigger('next', {
				nav: `KeyPress:${keyNames[e.keyCode]}`,
			});
			return false;
		} else if (e.keyCode === 73) {
			// 'i'
			this.trigger('toggle-info');
		}
	}

	loadAtIndex(i) {
		this.index = i;
		this.trigger('reload');
		if (this.useSwipe) {
			this.translateContent(this.index, 0, 0);
		} else {
			this.scrollTo(this.index);
		}
	}
}
// TODO: If we add `states` to the list of annotations within the class, it is `undefined` in the constructor. Wat?

HostedGallery.prototype.states = {
	image: {
		enter() {
			const that = this;

			// load prev/current/next
			this.loadSurroundingImages(this.index, this.$images.length);
			this.$captions.forEach((caption, index) => {
				this.toggleClass(
					caption,
					'current-caption',
					that.index === index + 1,
				);
			});
			this.$counter.textContent = `${this.index}/${this.$images.length}`;

			if (this.useSwipe) {
				this.translateContent(this.index, 0, 100);
				this.toggleClass(
					this.$galleryEl,
					'show-oj',
					this.index === this.$images.length,
				);
				this.toggleClass(
					this.$galleryEl,
					'show-cta',
					this.index === HostedGallery.ctaIndex() + 1,
				);
			}

			const pageName =
				config.get('page.pageName') ||
				window.location.pathname.substr(
					window.location.pathname.lastIndexOf('/') + 1,
				);
			pushUrl({}, document.title, `${pageName}#img-${this.index}`, true);
			// event bindings
			mediator.on('window:throttledResize', this.resize);
		},
		leave() {
			this.trigger('hide-info');
			mediator.off('window:throttledResize', this.resize);
		},
		events: {
			next(e) {
				if (this.index < this.$images.length) {
					// last img
					this.index += 1;
					this.trackNavBetweenImages(e);
				}
				this.reloadState = true;
			},
			prev(e) {
				if (this.index > 1) {
					// first img
					this.index -= 1;
					this.trackNavBetweenImages(e);
				}
				this.reloadState = true;
			},
			reload(e) {
				this.trackNavBetweenImages(e);
				this.reloadState = true;
			},
			'toggle-info': function () {
				this.$captionContainer.classList.toggle(
					'hosted-gallery--show-caption',
				);
			},
			'hide-info': function () {
				this.$captionContainer.classList.remove(
					'hosted-gallery--show-caption',
				);
			},
			'show-info': function () {
				this.$captionContainer.classList.add(
					'hosted-gallery--show-caption',
				);
			},
			resize() {
				this.onResize();
			},
		},
	},
};

export const init = () => {
	if (document.querySelectorAll('.js-hosted-gallery-container').length) {
		return loadCssPromise.then(() => {
			let res;
			const galleryHash = window.location.hash;
			const gallery = new HostedGallery();
			const match = /\?index=(\d+)/.exec(document.location.href);
			if (match) {
				// index specified so launch gallery at that index
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
};
