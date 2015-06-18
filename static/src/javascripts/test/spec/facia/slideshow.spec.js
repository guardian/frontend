import Promise from 'Promise';
import bonzo from 'bonzo';
import qwery from 'qwery';
import fastdom from 'fastdom';
import mediator from 'common/utils/mediator';
import slideshowState from 'facia/modules/ui/slideshow/state';
import slideshowController from 'facia/modules/ui/slideshow/controller';
import slideshowDOM from 'facia/modules/ui/slideshow/dom';
import accessibility from 'common/modules/accessibility/main';

var mockDOM = {
    insert: function (image) {
        return Promise.resolve(image);
    },
    transition: function () {
        return Promise.resolve();
    },
    remove: function () {
        return Promise.resolve();
    }
},
originalSetTimeout = setTimeout;
function opacity(element) {
    return parseInt(element.css('opacity'), 10);
}
function tick(ms) {
    jasmine.clock().tick(ms);
    return new Promise(function (resolve) {
        originalSetTimeout(resolve, 46);
    });
}

describe('Slideshow component', function () {
    describe('Initialize from DOM', function () {
        it('generate a list of images', function (done) {
            var testDOM = bonzo.create([
                '<div class="TEST_CONTAINER_SLIDESHOW_INITIALIZE">',
                    '<img class="test-image-1" src="/base/javascripts/test/fixtures/slideshow/one.svg">',
                    '<img class="test-image-2 js-lazy-loaded-slideshow" data-srcset="/base/javascripts/test/fixtures/slideshow/two.svg">',
                    '<img class="test-image-3 js-lazy-loaded-slideshow" data-srcset="/base/javascripts/test/fixtures/slideshow/three.svg">',
                '</div>'
            ].join(''));

            var container = bonzo(testDOM).appendTo(document.body);
            slideshowDOM.init(container[0])
            .then(function (listOfImages) {
                expect(listOfImages.length).toBe(3);
                expect(listOfImages[0].node[0].tagName.toLowerCase()).toBe('img');
                expect(listOfImages[0].loaded).toBe(true);
                expect(listOfImages[1].node[0].tagName.toLowerCase()).toBe('img');
                expect(listOfImages[1].loaded).toBe(false);
                expect(listOfImages[2].node[0].tagName.toLowerCase()).toBe('img');
                expect(listOfImages[2].loaded).toBe(false);
            })
            .then(function () {
                container.remove();
                done();
            });
        });
    });

    describe('Image loader', function () {
        beforeEach(function () {
            var testDOM = bonzo.create([
                '<div class="TEST_CONTAINER_SLIDESHOW_LOADER">',
                    '<img class="test-image-1" data-srcset="/base/javascripts/test/fixtures/slideshow/one.svg">',
                    '<img class="test-image-2" data-srcset="this_image_doesnt_exists.png">',
                '</div>'
            ].join(''));

            bonzo(testDOM).appendTo(document.body);
        });
        afterEach(function () {
            bonzo(qwery('.TEST_CONTAINER_SLIDESHOW_LOADER')).remove();
        });

        it('loads an image correctly', function (done) {
            var container = qwery('.TEST_CONTAINER_SLIDESHOW_LOADER'),
                eventCalled = jasmine.createSpy('eventCalled');

            mediator.on('ui:images:lazyLoaded', eventCalled);
            slideshowDOM.insert({
                node: bonzo(container[0].childNodes[0]),
                loaded: false
            })
            .then(function (img) {
                expect(img.loaded).toBe(true);
                expect(img.node[0].tagName.toLowerCase()).toBe('img');
                expect(opacity(img.node)).toBe(0);
                expect(eventCalled.calls.count()).toEqual(1);
                expect(eventCalled.calls.argsFor(0)[0]).toBe(img.node[0]);

                // Remove the image just to insert it again later
                return slideshowDOM.remove(img);
            })
            .then(function (img) {
                // Fake the transition by changing the opacity
                bonzo(img.node).css('opacity', '1');
                return slideshowDOM.insert(img);
            })
            .then(function (img) {
                expect(img.loaded).toBe(true);
                expect(img.node[0].tagName.toLowerCase()).toBe('img');
                expect(opacity(img.node)).toBe(0);
                // The image was already loaded, I don't expect other events
                expect(eventCalled.calls.count()).toEqual(1);
            })
            .then(done);
        });

        // There's no way to detect image fail
    });

    describe('State machine', function () {
        var listOfImages = [{
            src: 'one'
        }, {
            src: 'two'
        }, {
            src: 'three'
        }];

        beforeEach(function () {
            spyOn(mockDOM, 'insert').and.callThrough();
            spyOn(mockDOM, 'transition').and.callThrough();
        });

        it('transition between states', function (done) {
            var state = slideshowState.init(listOfImages, mockDOM);

            expect(state.active()).toEqual(listOfImages[0]);
            expect(mockDOM.insert).not.toHaveBeenCalled();

            state.goTo(2).then(function () {
                expect(state.active()).toEqual(listOfImages[2]);
                expect(mockDOM.insert.calls.count()).toBe(1);
                expect(mockDOM.insert.calls.argsFor(0)).toEqual([listOfImages[2]]);

                return state.next();
            })
            .then(function () {
                expect(state.active()).toEqual(listOfImages[0]);
                expect(mockDOM.insert.calls.count()).toBe(2);
                expect(mockDOM.insert.calls.argsFor(1)).toEqual([listOfImages[0]]);

                return state.next();
            })
            .then(function () {
                expect(state.active()).toEqual(listOfImages[1]);
                expect(mockDOM.insert.calls.count()).toBe(3);
                expect(mockDOM.insert.calls.argsFor(2)).toEqual([listOfImages[1]]);

                return state.next();
            })
            .then(function () {
                expect(state.active()).toEqual(listOfImages[2]);
                expect(mockDOM.insert.calls.count()).toBe(4);
                expect(mockDOM.insert.calls.argsFor(3)).toEqual([listOfImages[2]]);

                // Go to the same state we're in
                return state.goTo(2);
            })
            .then(function () {
                // Nothing should happen
                expect(state.active()).toEqual(listOfImages[2]);
                expect(mockDOM.insert.calls.count()).toBe(4);
            })
            .then(done);
        });

        it('plays automatically', function (done) {
            jasmine.clock().install();

            var state = slideshowState.init(listOfImages, mockDOM);

            state.start();
            expect(state.active()).toEqual(listOfImages[0]);
            expect(mockDOM.insert).not.toHaveBeenCalled();

            tick(slideshowState.interval)
            .then(function () {
                expect(state.active()).toEqual(listOfImages[1]);
                expect(mockDOM.insert.calls.count()).toBe(1);

                state.stop();

                return tick(2 * slideshowState.interval);
            })
            .then(function () {
                expect(state.active()).toEqual(listOfImages[1]);
                expect(mockDOM.insert.calls.count()).toBe(1);

                // start after stop is like a resume, continue from the last state
                state.start();
                return tick(slideshowState.interval);
            })
            .then(function () {
                expect(state.active()).toEqual(listOfImages[2]);
                expect(mockDOM.insert.calls.count()).toBe(2);

                // starting multiple times doesn't break the state
                state.start();
                state.start();
                state.start();
                return tick(slideshowState.interval);
            })
            .then(function () {
                expect(state.active()).toEqual(listOfImages[0]);
                expect(mockDOM.insert.calls.count()).toBe(3);
            })
            .then(function () {
                jasmine.clock().uninstall();
                state.stop();
                done();
            });
        });

        it('transition with one image errors', function (done) {
            var state = slideshowState.init(['works', 'fail', 'works too'], {
                insert: function (img) {
                    if (img === 'fail') {
                        return Promise.reject(new Error());
                    } else {
                        return Promise.resolve(img);
                    }
                },
                transition: function () {
                    return Promise.resolve();
                },
                remove: function () {
                    return Promise.resolve();
                }
            });

            state.next().then(function () {
                expect(state.active()).toEqual('works too');

                return state.next();
            })
            .then(function () {
                expect(state.active()).toEqual('works');

                return state.goTo(1);
            })
            .then(function () {
                expect(state.active()).toEqual('works too');
            })
            .then(done);
        });

        it('transition when everything fails', function (done) {
            var insertCount = 0;
            var state = slideshowState.init(['works', 'fail', 'fail'], {
                insert: function (img) {
                    insertCount += 1;
                    if (img === 'fail') {
                        return Promise.reject(new Error());
                    } else {
                        return Promise.resolve('works');
                    }
                },
                transition: function () {
                    return Promise.resolve();
                },
                remove: function () {
                    return Promise.resolve();
                }
            });

            state.next().then(function () {
                expect(state.active()).toEqual('works');
                expect(insertCount).toBe(2);
            })
            .then(done);
        });
    });

    describe('Transition', function () {
        beforeEach(function () {
            this.originalDuration = slideshowDOM.duration;

            var testDOM = bonzo.create([
                '<div class="TEST_CONTAINER_SLIDESHOW_TRANSITION">',
                    '<img class="test-image-1" src="/base/javascripts/test/fixtures/slideshow/one.svg">',
                    '<img class="test-image-2" src="/base/javascripts/test/fixtures/slideshow/two.svg">',
                    '<img class="test-image-3" src="/base/javascripts/test/fixtures/slideshow/three.svg">',
                '</div>'
            ].join(''));

            var container = bonzo(testDOM).appendTo(document.body);
            container.css({
                position: 'relative'
            });
            qwery('img', container[0]).forEach(function (img, index) {
                bonzo(img).css({
                    position: 'absolute',
                    opacity: index === 0 ? 1 : 0
                });
            });
        });

        afterEach(function () {
            slideshowDOM.duration = this.originalDuration;
            bonzo(qwery('.TEST_CONTAINER_SLIDESHOW_TRANSITION')).remove();
        });

        it('fades from one image to the other', function (done) {
            var imageOne = bonzo(qwery('.test-image-1')),
                imageTwo = bonzo(qwery('.test-image-2'));

            expect(opacity(imageOne)).toBe(1);
            expect(opacity(imageTwo)).toBe(0);

            slideshowDOM.duration = 20;
            slideshowDOM.transition({
                node: imageOne
            }, {
                node: imageTwo
            })
            .then(function () {
                expect(opacity(imageOne)).toBe(0);
                expect(opacity(imageTwo)).toBe(1);

                // Check that an image that was set hidden can be showed again
                return slideshowDOM.transition({
                    node: imageTwo
                }, {
                    node: imageOne
                });
            })
            .then(function () {
                expect(opacity(imageOne)).toBe(1);
                expect(opacity(imageTwo)).toBe(0);
            })
            .then(done);
        });
    });

    describe('Controller', function () {
        beforeEach(function () {
            this.originalFastdomWrite = fastdom.write;
            fastdom.write = function (action) {
                action();
            };
            jasmine.clock().install();
        });
        afterEach(function () {
            fastdom.write = this.originalFastdomWrite;
            jasmine.clock().uninstall();
        });

        it('auto plays inline images', function (done) {
            var testDOM = bonzo.create([
                '<div class="TEST_CONTAINER_SLIDESHOW_PLAY_INLINE js-slideshow">',
                    '<img class="test-image-1" src="/base/javascripts/test/fixtures/slideshow/one.svg">',
                    '<img class="test-image-2 js-lazy-loaded-slideshow" data-srcset="/base/javascripts/test/fixtures/slideshow/two.svg">',
                    '<img class="test-image-3 js-lazy-loaded-slideshow" data-srcset="/base/javascripts/test/fixtures/slideshow/three.svg">',
                '</div>'
            ].join('')),
                container = bonzo(testDOM).appendTo(document.body),
                opacityOf = function (selector) {
                    return opacity(bonzo(qwery(selector)));
                },
                nextImage = function () {
                    return tick(slideshowState.interval)
                    .then(function () {
                        return tick(slideshowDOM.loadTime);
                    })
                    .then(function () {
                        return tick(slideshowDOM.duration);
                    });
                };

            slideshowController.init();

            nextImage()
            .then(function () {
                expect(opacityOf('.test-image-1', container[0])).toBe(0);
                expect(opacityOf('.test-image-2', container[0])).toBe(1);

                return nextImage();
            })
            .then(function () {
                expect(opacityOf('.test-image-1', container[0])).toBe(0);
                expect(opacityOf('.test-image-2', container[0])).toBe(0);
                expect(opacityOf('.test-image-3', container[0])).toBe(1);

                return nextImage();
            })
            .then(function () {
                expect(opacityOf('.test-image-1', container[0])).toBe(1);
                expect(opacityOf('.test-image-2', container[0])).toBe(0);
                expect(opacityOf('.test-image-3', container[0])).toBe(0);
            })
            .then(function () {
                slideshowController.destroy();
                container.remove();
            })
            .then(done);
        });

        it('auto plays lazy loaded images', function (done) {
            var testDOM = bonzo.create([
                '<div class="TEST_CONTAINER_SLIDESHOW_PLAY_LAZY js-slideshow">',
                    '<img class="test-image-1 js-lazy-loaded-image" data-srcset="/base/javascripts/test/fixtures/slideshow/one.svg">',
                    '<img class="test-image-2 js-lazy-loaded-slideshow" data-srcset="/base/javascripts/test/fixtures/slideshow/two.svg">',
                    '<img class="test-image-3 js-lazy-loaded-slideshow" data-srcset="/base/javascripts/test/fixtures/slideshow/three.svg">',
                '</div>'
            ].join('')),
                container = bonzo(testDOM).appendTo(document.body),
                opacityOf = function (selector) {
                    return opacity(bonzo(qwery(selector)));
                },
                nextImage = function (img) {
                    return tick(slideshowState.interval).then(function () {
                        mediator.emit('ui:images:lazyLoaded', img);
                        return new Promise(function (resolve) {
                            originalSetTimeout(resolve, 100);
                        });
                    })
                    .then(function () {
                        return tick(slideshowDOM.loadTime);
                    })
                    .then(function () {
                        return tick(slideshowDOM.duration);
                    });
                };

            slideshowController.init();

            nextImage(qwery('.test-image-1', container[0])[0])
            .then(function () {
                expect(opacityOf('.test-image-1', container[0])).toBe(0);
                expect(opacityOf('.test-image-2', container[0])).toBe(1);

                return nextImage();
            })
            .then(function () {
                expect(opacityOf('.test-image-1', container[0])).toBe(0);
                expect(opacityOf('.test-image-2', container[0])).toBe(0);
                expect(opacityOf('.test-image-3', container[0])).toBe(1);

                return nextImage();
            })
            .then(function () {
                expect(opacityOf('.test-image-1', container[0])).toBe(1);
                expect(opacityOf('.test-image-2', container[0])).toBe(0);
                expect(opacityOf('.test-image-3', container[0])).toBe(0);
            })
            .then(function () {
                slideshowController.destroy();
                container.remove();
            })
            .then(done);
        });

        it('doesn\'t play when accessibility is off', function (done) {
            accessibility.saveState({
                'flashing-elements': false
            });

            var testDOM = bonzo.create([
                '<div class="TEST_CONTAINER_SLIDESHOW_PLAY_INLINE js-slideshow">',
                    '<img class="test-image-1" src="/base/javascripts/test/fixtures/slideshow/one.svg">',
                    '<img class="test-image-2 js-lazy-loaded-slideshow" data-srcset="/base/javascripts/test/fixtures/slideshow/two.svg">',
                    '<img class="test-image-3 js-lazy-loaded-slideshow" data-srcset="/base/javascripts/test/fixtures/slideshow/three.svg">',
                '</div>'
            ].join('')),
                container = bonzo(testDOM).appendTo(document.body),
                opacityOf = function (selector) {
                    return opacity(bonzo(qwery(selector)));
                },
                nextImage = function () {
                    return tick(slideshowState.interval)
                    .then(function () {
                        return tick(slideshowDOM.loadTime);
                    })
                    .then(function () {
                        return tick(slideshowDOM.duration);
                    });
                };

            slideshowController.init();

            nextImage()
            .then(function () {
                // Nothing should happen
                expect(opacityOf('.test-image-1', container[0])).toBe(1);

                window.localStorage.clear();
                done();
            });
        });
    });
});

