'use strict';

// jshint -W030: true, es3: false, -W024: true
/* globals Imager, describe, it, expect, beforeEach, afterEach, sinon */

describe('Imager Container Strategy', function () {
    var doc, sandbox, instance, fixtures, strategy;

    beforeEach(function () {
        doc = document.createElement('div');
        doc.innerHTML = window.__html__['test/fixtures/strategy-container.html'];

        sandbox = sinon.sandbox.create();
        fixtures = doc.querySelectorAll('#container .delayed-image-load');

        instance = new Imager(fixtures, { strategy: 'container' });
        strategy = instance.strategy;
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('applyOnPlaceholder', function () {
        it('should detect an enclosed placeholder', function () {
            expect(strategy.applyOnPlaceholder(doc.querySelector('.delayed-image-load'))).to.be.false;
            expect(strategy.applyOnPlaceholder(doc.querySelector('#container'))).to.be.false;

            expect(strategy.applyOnPlaceholder(doc.querySelector('#preloaded-placeholder .delayed-image-load'))).to.be.true;
        });

        it('should optionally apply a callback on the found placeholder', function (done) {
            var container = doc.querySelector('#preloaded-placeholder .delayed-image-load');

            strategy.applyOnPlaceholder(container, function (placeholder, element) {
                expect(element).not.to.equal(placeholder);
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

            expect(container.querySelector('.responsive-img').src).to.equal('http://placehold.it/200/picture2.jpg');

            strategy.updatePlaceholderUri(container, 'http://example.com/default.jpg');

            expect(container.querySelector('.responsive-img').src).to.equal('http://example.com/default.jpg');
        });
    });

    describe('Imager.process', function () {
        it('should keep intact the original array of nodes', function (done) {
            instance.process(function () {
                expect(this.nodes).to.deep.equal(Array.prototype.slice.call(fixtures));

                done();
            });
        });
    });

    describe('createPlaceholder', function () {
        it('should create placeholder pictures in the container', function () {
            var placeholder;
            var strategySpy = sandbox.spy(instance.strategy, 'createPlaceholder');

            instance.process();

            placeholder = fixtures[0].querySelector('img');

            expect(placeholder).to.be.instanceOf(HTMLElement);
            expect(placeholder.src).to.equal('data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=');
            expect(placeholder.classList.contains('responsive-img')).to.be.true;

            //we make sure we have two distinct image objects
            expect(placeholder).not.to.equal(fixtures[1].querySelector('img'));
            expect(strategySpy.callCount).to.equal(2);
        });

        it('should not create two placeholder for the same container', function () {
            var strategySpy = sandbox.spy(instance.strategy, 'createPlaceholder');

            instance.process();
            instance.process();

            expect(fixtures[0].querySelectorAll('img')).to.have.length.of(1);
            expect(strategySpy.callCount).to.equal(2);
        });
    });
});
