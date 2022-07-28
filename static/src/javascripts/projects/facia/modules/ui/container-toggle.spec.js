import $ from 'lib/$';
import bonzo from 'bonzo';
import fastdom from 'fastdom';
import { mediator } from 'lib/mediator';
import userPrefs from 'common/modules/user-prefs';
import { ContainerToggle } from 'facia/modules/ui/container-toggle';

describe('Container Toggle', () => {
    let container;
    let $container;
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

    const simulateClick = () => {
        mediator.emit('module:clickstream:click', {
            target: $('button', container)[0],
        });
    };

    beforeEach(() => {
        container = bonzo.create(
            `<section class="fc-container js-container--toggle fc-container__will-have-toggle" data-id="${containerId}">` +
                `<div class="fc-container__header js-container__header">` +
                `<h2>A container</h2>` +
                `</div>` +
                `</section>`
        );
        $container = bonzo(container[0]);
    });

    afterEach(() => {
        $container.remove();
        userPrefs.remove('container-states');
    });

    it('should be able to initialise', () => {
        const containerDisplayToggle = new ContainerToggle(container);
        expect(containerDisplayToggle).toBeDefined();
    });

    it('should remove "js-container--toggle" class from container', done => {
        const toggle = new ContainerToggle(container);
        toggle.addToggle();

        fastdom.mutate(() => {
            expect($container.hasClass('js-container--toggle')).toBeFalsy();
            done();
        });
    });

    it('should remove "fc-container--will-have-toggle" class from container', done => {
        const toggle = new ContainerToggle(container);
        toggle.addToggle();

        fastdom.mutate(() => {
            expect(
                $container.hasClass('fc-container--will-have-toggle')
            ).toBeFalsy();
            done();
        });
    });

    it('should add "container--has-toggle" class to container', done => {
        const toggle = new ContainerToggle(container);
        toggle.addToggle();

        fastdom.mutate(() => {
            expect(
                $container.hasClass('fc-container--has-toggle')
            ).toBeTruthy();
            done();
        });
    });

    it("should add button to the container's header", done => {
        const toggle = new ContainerToggle(container);
        toggle.addToggle();

        fastdom.mutate(() => {
            expect(
                $('.js-container__header .fc-container__toggle', container)
                    .length
            ).toBe(1);
            done();
        });
    });

    it('initial state should be open', done => {
        const toggle = new ContainerToggle(container);
        toggle.addToggle();

        fastdom.mutate(() => {
            assertState($container, 'open');
            done();
        });
    });

    it('should be able to close container', done => {
        const toggle = new ContainerToggle(container);
        toggle.addToggle();

        fastdom.mutate(() => {
            simulateClick();

            fastdom.mutate(() => {
                assertState($container, 'closed');
                done();
            });
        });
    });

    it('should store state as user preference', done => {
        const toggle = new ContainerToggle(container);
        toggle.addToggle();

        // click button
        fastdom.mutate(() => {
            simulateClick();

            const expectedValue = {};
            expectedValue[containerId] = 'closed';

            fastdom.mutate(() => {
                expect(userPrefs.get(storageId)).toEqual(expectedValue);

                // now close container
                simulateClick();

                fastdom.mutate(() => {
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
        const toggle = new ContainerToggle(container);
        toggle.addToggle();

        fastdom.mutate(() => {
            assertState($container, 'closed');
            done();
        });
    });
});
