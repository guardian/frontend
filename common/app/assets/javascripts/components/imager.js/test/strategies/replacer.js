'use strict';

// jshint -W030: true, es3: false, -W024: true
/* globals Imager, describe, it, expect, beforeEach, afterEach, sinon */

describe('Imager Legacy Strategy', function () {
    var doc, sandbox, instance, fixtures, strategy;

    beforeEach(function () {
        doc = document.createElement('div');
        doc.innerHTML = window.__html__['test/fixtures/strategy-replacer.html'];

        sandbox = sinon.sandbox.create();
        fixtures = doc.querySelectorAll('#container .delayed-image-load');

        instance = new Imager(fixtures);
        strategy = instance.strategy;
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('applyOnPlaceholder', function () {
        it('should detect if the element is a placeholder', function () {
            expect(strategy.applyOnPlaceholder(doc.querySelector('.delayed-image-load'))).to.be.false;
            expect(strategy.applyOnPlaceholder(doc.querySelector('#container'))).to.be.false;

            expect(strategy.applyOnPlaceholder(doc.querySelector('#preloaded-placeholder .delayed-image-load'))).to.be.true;
        });

        it('should optionally apply a callback on the found placeholder', function (done) {
            var container = doc.querySelector('#preloaded-placeholder .delayed-image-load');

            strategy.applyOnPlaceholder(container, function (placeholder, element) {
                expect(element).to.equal(placeholder);
                expect(element).to.equal(container);

                done();
            });
        });
    });

    describe('requiresPlaceholder', function () {
        it('should indicate that we should create a placeholder', function () {
            expect(strategy.requiresPlaceholder(doc.querySelector('.delayed-image-load'))).to.be.true;
        });

        it('should indicate that we should not create a placeholder', function () {
            expect(strategy.requiresPlaceholder(doc.querySelector('#container'))).to.be.false;
            expect(strategy.requiresPlaceholder(doc.querySelector('#preloaded-placeholder .delayed-image-load'))).to.be.false;
        });
    });

    describe('updatePlaceholderUri', function () {
        it('should update the `src` attribute of a found placeholder', function () {
            var container = doc.querySelector('#preloaded-placeholder .delayed-image-load');

            expect(container.src).to.equal('http://placehold.it/200/picture2.jpg');

            strategy.updatePlaceholderUri(container, 'http://example.com/default.jpg');

            expect(container.src).to.equal('http://example.com/default.jpg');
        });
    });

    describe('Imager.process', function () {
        it('should replace the div nodes by the newly created img elements', function (done) {
            instance.process(function () {
                expect(this.nodes).not.to.deep.equal(Array.prototype.slice.call(fixtures));
                expect(this.nodes[0].nodeName).to.equal('IMG');
                expect(fixtures[0].nodeName).to.equal('DIV');

                done();
            });
        });
    });

    describe('createPlaceholder', function () {
        it('should replace container elements by placeholder', function () {
            var strategySpy = sandbox.spy(instance.strategy, 'createPlaceholder');

            instance.process();

            expect(instance.nodes[0]).to.be.instanceOf(HTMLElement);
            expect(instance.nodes[0].src).to.equal('data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=');
            expect(instance.nodes[0].classList.contains('responsive-img')).to.be.true;

            //we make sure we have two distinct image objects
            expect(instance.nodes[0]).not.to.equal(fixtures[0]);
            expect(strategySpy.callCount).to.equal(2);
        });
    });
});
