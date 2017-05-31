// @flow
import $ from 'lib/$';
import bonzo from 'bonzo';
import fastdom from 'fastdom';
import userPrefs from 'common/modules/user-prefs';
import { ContainerToggle } from 'facia/modules/ui/container-toggle';

describe('Container Toggle', () => {
    let container;
    let $container;
    let mediator;
    const containerId = 'uk/culture/regular-stories';
    const storageId = 'container-states';
    // helper assertion method
    const assertState = ($cont, state) => {
        const $button = $('button', $cont[0]);

        expect($cont.hasClass('fc-container--rolled-up'))[
            state === 'open' ? 'toBeFalsy' : 'toBeTruthy'
        ]();
        expect($button.text().trim()).toBe(state === 'open' ? 'Hide' : 'Show');
        expect($button.attr('data-link-name')).toBe(
            state === 'open' ? 'Show' : 'Hide'
        );
    };

    function simulateClick() {
        mediator.emit('module:clickstream:click', {
            target: $('button', container)[0],
        });
    }

    beforeEach(done => {
        container = bonzo.create(
            `<section class="fc-container js-container--toggle" data-id="${containerId}">` +
                `<div class="fc-container__header js-container__header">` +
                `<h2>A container</h2>` +
                `</div>` +
                `</section>`
        )[0];
        $container = bonzo(container);

        done();
    });

    afterEach(() => {
        $container.remove();
    });

    it('should be able to initialise', () => {
        const containerDisplayToggle = new ContainerToggle(container);
        expect(containerDisplayToggle).toBeDefined();
    });

    it('should remove "js-container--toggle" class from container', done => {
        new ContainerToggle(container).addToggle();

        console.log($container.hasClass('js-container--toggle'));
        fastdom.defer(1, () => {
            console.log('foo');
            console.log(`bar: ${$container.hasClass('js-container--toggle')}`);
            expect($container.hasClass('js-container--toggle')).toBeFalsy();
            done();
        });
    });

    it('should add "container--has-toggle" class to container', done => {
        new ContainerToggle(container).addToggle();

        fastdom.defer(1, () => {
            expect(
                $container.hasClass('fc-container--has-toggle')
            ).toBeTruthy();
            done();
        });
    });

    it("should add button to the container's header", done => {
        new ContainerToggle(container).addToggle();

        fastdom.defer(1, () => {
            expect(
                $('.js-container__header .fc-container__toggle', container)
                    .length
            ).toBe(1);
            done();
        });
    });

    it('initial state should be open', done => {
        new ContainerToggle(container).addToggle();

        fastdom.defer(1, () => {
            assertState($container, 'open');
            done();
        });
    });

    it('should be able to close container', done => {
        new ContainerToggle(container).addToggle();

        fastdom.defer(1, () => {
            simulateClick();

            fastdom.defer(1, () => {
                assertState($container, 'closed');
                done();
            });
        });
    });

    it('should store state as user preference', done => {
        new ContainerToggle(container).addToggle();
        // click button

        fastdom.defer(1, () => {
            simulateClick();

            const expectedValue = {};
            expectedValue[containerId] = 'closed';

            fastdom.defer(1, () => {
                expect(userPrefs.get(storageId)).toEqual(expectedValue);

                // now close container
                simulateClick();

                fastdom.defer(1, () => {
                    expect(userPrefs.get(storageId)).toEqual({});

                    done();
                });
            });
        });
    });

    it('initial state should be based on user preference', done => {
        const prefs = {};
        prefs[containerId] = 'closed';
        userPrefs.set(storageId, prefs);
        new ContainerToggle(container).addToggle();

        fastdom.defer(1, () => {
            assertState($container, 'closed');
            done();
        });
    });
});
