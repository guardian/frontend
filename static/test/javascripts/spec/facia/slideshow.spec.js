define([
    'Promise',
    'bonzo',
    'qwery',
    'fastdom',
    'common/utils/mediator',
    'facia/modules/ui/slideshow/state',
    'facia/modules/ui/slideshow/controller',
    'facia/modules/ui/slideshow/dom'
], function (
    Promise,
    bonzo,
    qwery,
    fastdom,
    mediator,
    slideshowState,
    slideshowController,
    slideshowDOM
) {
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
    };
    function imagePath (name) {
        return 'base/static/test/javascripts/fixtures/slideshow/' + name;
    }
    function opacity (element) {
        return parseInt(element.css('opacity'), 10);
    }
    function tick (ms) {
        jasmine.clock().tick(ms);
        return new Promise(function (resolve) {
            fastdom.defer(3, resolve);
        });
    }

    fdescribe('Slideshow component', function () {
        describe('Initialize from DOM', function () {
            it('generate a list of images', function (done) {
                var testDOM = bonzo.create([
                    '<div class="TEST_CONTAINER_SLIDESHOW_INITIALIZE">',
                        '<img class="test-image-1" src="base/static/test/javascripts/fixtures/slideshow/one.svg">',
                        '<!-- <img class="test-image-2" src="base/static/test/javascripts/fixtures/slideshow/two.svg"> -->',
                        '  \n  ', // random useless characters
                        '<!-- <img class="test-image-3" src="base/static/test/javascripts/fixtures/slideshow/three.svg"> -->',
                    '</div>'
                ].join(''));

                var container = bonzo(testDOM).appendTo(document.body);
                slideshowDOM.init(container[0])
                .then(function (listOfImages) {
                    expect(listOfImages.length).toBe(3);
                    expect(listOfImages[0][0].tagName.toLowerCase()).toBe('img');
                    expect(listOfImages[1].nodeType).toBe(Node.COMMENT_NODE);
                    expect(listOfImages[2].nodeType).toBe(Node.COMMENT_NODE);
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
                        '<!-- <img class="test-image-1" src="base/static/test/javascripts/fixtures/slideshow/one.svg"> -->',
                        '<!-- <img class="test-image-2" src="this_image_doesnt_exists.png"> -->',
                    '</div>'
                ].join(''));

                bonzo(testDOM).appendTo(document.body);
            });
            afterEach(function () {
                bonzo(qwery('.TEST_CONTAINER_SLIDESHOW_LOADER')).remove();
            });

            it('loads an image correctly', function (done) {
                var container = qwery('.TEST_CONTAINER_SLIDESHOW_LOADER'),
                    loadedImage,
                    eventCalled = jasmine.createSpy('eventCalled');

                mediator.on('ui:images:lazyLoaded', eventCalled);
                slideshowDOM.insert(container[0].childNodes[0])
                .then(function (img) {
                    expect(img[0].tagName.toLowerCase()).toBe('img');
                    expect(img[0].src).toMatch('slideshow/one.svg');
                    expect(qwery('img', container[0]).length).toBe(1);
                    expect(opacity(img)).toBe(0);
                    expect(eventCalled.calls.count()).toEqual(1);
                    expect(eventCalled.calls.argsFor(0)[0]).toBe(img[0]);

                    // Remove the image just to insert it again later
                    loadedImage = img;
                    return slideshowDOM.remove(img);
                })
                .then(function () {
                    // Fake the transition by changing the opacity
                    loadedImage.css('opacity', '1');
                    return slideshowDOM.insert(loadedImage);
                })
                .then(function (img) {
                    expect(img[0].tagName.toLowerCase()).toBe('img');
                    expect(img[0].src).toMatch('slideshow/one.svg');
                    expect(qwery('img', container[0]).length).toBe(1);
                    expect(opacity(img)).toBe(0);
                    // The image was already loaded, I don't expect other events
                    expect(eventCalled.calls.count()).toEqual(1);
                })
                .then(done);
            });

            it('fails when the image is missing', function (done) {
                var container = qwery('.TEST_CONTAINER_SLIDESHOW_LOADER'),
                    loadedImage;

                slideshowDOM.insert(container[0].childNodes[1])
                .then(function (img) {
                    expect(false).toBe('Loading an invalid image should fail');
                    done();
                }, function () {
                    done();
                });
            });
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
                // Assume that the first image is already in the DOM, don't load it
                expect(mockDOM.insert).not.toHaveBeenCalled();

                state.goTo(2).then(function () {
                    expect(state.active()).toEqual(listOfImages[2]);
                    expect(mockDOM.insert.calls.count()).toBe(1);
                    expect(mockDOM.insert.calls.argsFor(0)).toEqual([listOfImages[2]]);

                    return state.next();
                })
                .then(function () {
                    expect(state.active()).toEqual(listOfImages[0]);
                    // The firs image was already loaded, no need to load it again
                    expect(mockDOM.insert.calls.count()).toBe(1);

                    return state.next();
                })
                .then(function () {
                    expect(state.active()).toEqual(listOfImages[1]);
                    expect(mockDOM.insert.calls.count()).toBe(2);
                    expect(mockDOM.insert.calls.argsFor(1)).toEqual([listOfImages[1]]);

                    return state.next();
                })
                .then(function () {
                    expect(state.active()).toEqual(listOfImages[2]);
                    // The third image was loaded before, no need to load it again
                    expect(mockDOM.insert.calls.count()).toBe(2);

                    // Go to the same state we're in
                    return state.goTo(2);
                })
                .then(function () {
                    // Nothing should happen
                    expect(state.active()).toEqual(listOfImages[2]);
                    expect(mockDOM.insert.calls.count()).toBe(2);
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
                    expect(mockDOM.insert.calls.count()).toBe(2);

                    jasmine.clock().uninstall();
                    state.stop();
                })
                .then(done);
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
                        '<img class="test-image-1" src="base/static/test/javascripts/fixtures/slideshow/one.svg">',
                        '<img class="test-image-2" src="base/static/test/javascripts/fixtures/slideshow/two.svg">',
                        '<img class="test-image-3" src="base/static/test/javascripts/fixtures/slideshow/three.svg">',
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
                slideshowDOM.transition(imageOne, imageTwo)
                .then(function () {
                    expect(opacity(imageOne)).toBe(0);
                    expect(opacity(imageTwo)).toBe(1);

                    // Check that an image that was set hidden can be showed again
                    return slideshowDOM.transition(imageTwo, imageOne);
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
                jasmine.clock().install();
            });
            afterEach(function () {
                jasmine.clock().uninstall();
            });

            it('auto plays', function (done) {
                // TODO actual JS class
                var testDOM = bonzo.create([
                    '<div class="TEST_CONTAINER_SLIDESHOW_PLAY js-slideshow">',
                        '<img class="test-image-1" src="base/static/test/javascripts/fixtures/slideshow/one.svg">',
                        '<!-- <img class="test-image-2" src="base/static/test/javascripts/fixtures/slideshow/two.svg"> -->',
                        '<!-- <img class="test-image-3" src="base/static/test/javascripts/fixtures/slideshow/three.svg"> -->',
                    '</div>'
                ].join(''));

                var container = bonzo(testDOM).appendTo(document.body);
                var inDOM = function (selector) {
                    return qwery(selector, container[0]).length > 0;
                };

                slideshowController.init();
                expect(inDOM('.test-image-1')).toBe(true);
                expect(inDOM('.test-image-2')).toBe(false);
                expect(inDOM('.test-image-3')).toBe(false);

                tick(slideshowState.interval)
                .then(function () {
                    expect(inDOM('.test-image-1')).toBe(true);
                    expect(inDOM('.test-image-2')).toBe(true);
                    expect(inDOM('.test-image-3')).toBe(false);

                    return tick(slideshowDOM.duration);
                })
                .then(function () {
                    expect(opacity(bonzo(qwery('.test-image-1', container[0])))).toBe(0);
                    expect(opacity(bonzo(qwery('.test-image-2', container[0])))).toBe(1);

                    return tick(slideshowState.interval);
                })
                .then(function () {
                    expect(inDOM('.test-image-1')).toBe(true);
                    expect(inDOM('.test-image-2')).toBe(true);
                    expect(inDOM('.test-image-3')).toBe(true);

                    return tick(slideshowDOM.duration);
                })
                .then(function () {
                    expect(opacity(bonzo(qwery('.test-image-1', container[0])))).toBe(0);
                    expect(opacity(bonzo(qwery('.test-image-2', container[0])))).toBe(0);
                    expect(opacity(bonzo(qwery('.test-image-3', container[0])))).toBe(1);

                    return tick(slideshowState.interval);
                })
                .then(function () {
                    expect(inDOM('.test-image-1')).toBe(true);
                    expect(inDOM('.test-image-2')).toBe(true);
                    expect(inDOM('.test-image-3')).toBe(true);

                    return tick(slideshowDOM.duration);
                })
                .then(function () {
                    expect(opacity(bonzo(qwery('.test-image-1', container[0])))).toBe(1);
                    expect(opacity(bonzo(qwery('.test-image-2', container[0])))).toBe(0);
                    expect(opacity(bonzo(qwery('.test-image-3', container[0])))).toBe(0);
                })
                .then(function () {
                    slideshowController.destroy();
                    bonzo(qwery('.TEST_CONTAINER_SLIDESHOW_PLAY')).remove();
                })
                .then(done);
            });
        });
    });
});
