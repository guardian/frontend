'use strict';

// jshint -W030: true, es3: false, -W024: true
/* globals Imager, describe, it, expect, beforeEach, afterEach, sinon */

describe('Imager', function () {
    var sandbox, doc, instance;

    beforeEach(function () {
        doc = document.createElement('div');
        doc.innerHTML = window.__html__['test/fixtures/imager.html'];

        instance = new Imager(generateNodes(10), {
          availableWidths: [320, 480, 666, 768, 1024],
          strategy: 'container'
        });
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    function generateNodes (count, tag) {
        return Array.apply(null, new Array(count)).map(function (item, i) {
            var el = document.createElement(tag || 'div');

            el.className = 'delayed-image-load';
            el.dataset.src = 'http://placehold.it/{width}/newpic' + (i * Math.random()) + '.jpg';

            return el;
        });
    }

    describe('constructor', function () {
        it('should compute the proper attributes', function () {
            expect(instance.nodes).to.be.an('array').and.to.have.length.of(10);
            expect(instance.availableWidths).to.be.an('array').and.to.contain(666);   // because not in the default config
            expect(instance.strategy.constructor).to.have.property('_id');
        });

        it('should configure properly its attributes based on an optional config argument', function () {
            var placeholder = document.createElement('img'),
                instance = new Imager(generateNodes(5), {
                    availableWidths: [50, 99, 120, 500],
                    placeholder: {
                        element: placeholder,
                        matchingClassName: 'responsive-img-alt'
                    }
                });

            placeholder.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';

            expect(instance.nodes).to.be.an('array').and.to.have.length.of(5);
            expect(instance.availableWidths).to.be.an('array').and.to.contain(99).and.not.to.contain(666);
            expect(instance.strategy.constructor).to.have.property('_id');
        });
    });

    describe('process', function () {
        it('should create placeholders prior to replacing responsive URIs', function (done) {
            var createPlaceholderStub = sandbox.stub(instance.strategy, 'createPlaceholder'),
                updateImagesSourceStub = sandbox.stub(instance, 'updateImagesSource');

            instance.process(function () {
                expect(instance._processing).to.be.false;
                expect(updateImagesSourceStub.called).to.be.true;
                expect(updateImagesSourceStub.calledAfter(createPlaceholderStub)).to.be.true;

                done();
            });

            expect(instance._processing).to.be.true;
            expect(createPlaceholderStub.called).to.be.true;
            expect(updateImagesSourceStub.called).to.be.false;
        });

        it('should be able to be called very frequently and compute once in a while', function () {
            var processSpy = sandbox.spy(instance, 'process'),
                tickSpy = sandbox.spy(instance, 'nextTick'),
                clock = sandbox.useFakeTimers(),
                operations_count = 1000;

            while (operations_count--) {
                instance.process();
            }

            expect(processSpy.callCount).to.equal(1000);
            expect(tickSpy.callCount).to.equal(1);

            clock.tick(10000);

            expect(processSpy.callCount).to.equal(1000);
            expect(tickSpy.callCount).to.equal(1);
        });
    });

    describe('update', function () {
        it('should replace the actual collection of nodes with a static array', function () {
            instance.update(undefined);
            expect(instance.nodes).to.be.empty;

            instance.update(generateNodes(4));
            expect(instance.nodes).to.have.length.of(4);

            instance.update(doc.getElementsByClassName('delayed-image-load'));
            expect(instance.nodes).to.have.length.of(3);

            instance.update(doc.querySelectorAll('#container div.delayed-image-load'));
            expect(instance.nodes).to.have.length.of(3);
        });

        it('should track new elements from a mutated object (ie: live NodeList)', function () {
            var liveNodeList = doc.getElementsByClassName('delayed-image-load');

            instance.update(liveNodeList);
            expect(instance.nodes).to.have.length.of(3);

            liveNodeList[0].parentNode.appendChild(generateNodes(1).pop());
            expect(instance.nodes).to.have.length.of(3);

            instance.update(liveNodeList);
            expect(instance.nodes).to.have.length.of(4);
        });
    });

    describe('updateImagesSource', function () {

    });

    describe('getBestWidth', function () {
        it('should return the closest available width to fit in', function () {
            expect(instance.getBestWidth(2000)).to.equal(1024);
            expect(instance.getBestWidth(481)).to.equal(666);
            expect(instance.getBestWidth(480)).to.equal(480);
            expect(instance.getBestWidth(479)).to.equal(480);
            expect(instance.getBestWidth(409)).to.equal(480);
            expect(instance.getBestWidth(50)).to.equal(320);
        });

        it('should use the default max width value if provided', function () {
            expect(instance.getBestWidth(50, 300)).to.equal(320);
            expect(instance.getBestWidth(2000, 300)).to.equal(300);
        });
    });

    describe('replaceUri', function () {
        it('should replace URI variables with defined values', function () {
            var values = {width: 350, pixel_ratio: '2x'};

            expect(Imager.replaceUri('http://placekitten.com/{width}/picture.jpeg', values)).to.equal('http://placekitten.com/350/picture.jpeg');
            expect(Imager.replaceUri('http://placekitten.com/width/picture.jpeg', values)).to.equal('http://placekitten.com/width/picture.jpeg');
            expect(Imager.replaceUri('http://placekitten.com/{width}-{pixel_ratio}/picture.jpeg', values)).to.equal('http://placekitten.com/350-2x/picture.jpeg');
        });

        it('should not replace an URI variable which has not been defined', function () {
            expect(Imager.replaceUri('http://placekitten.com/{width}/picture.jpeg', {})).to.equal('http://placekitten.com/{width}/picture.jpeg');
        });
    });
});
