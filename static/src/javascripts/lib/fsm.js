// @flow

import { noop } from 'lib/noop';

/*
    simple practical and flexible "finite state machine" implementation

    example options object: (see gallery/lightbox.js for a working example)
    var options = {
        initial: 'closed', // the initial state of the fsm
        context: element, // event functions are run in the context of this element
        states: {
            'closed': {
                enter: function() { this.hide(); }, // called when entering this state
                leave: function() { this.show(); }, // called when leaving this state
                events: { // events that can be triggered when in this state
                    'open': function() {
                        // transition to another state (closed.leave() and then image.enter()
                        // will be called on return from this function)
                        this.state = 'image';
                    }
                }
            },
            'image': {
                enter: function() {
                    // do stuff
                },
                events: {
                    'close': function() {
                        this.state = 'closed';
                    }
                }
            }
        }
    };
*/

class FiniteStateMachine {
    context: Object;
    states: Object;
    debug: ?boolean;
    onChangeState: (oldState: string, newState: string) => void;

    constructor(options: Object) {
        this.context = options.context;
        this.states = options.states || {};
        this.context.state = options.initial || '';
        this.debug = options.debug || false;
        this.onChangeState =
            options.onChangeState.bind(this.context) || (() => {});
    }

    log(...args: Array<string>): void {
        if (this.debug && window.console && window.console.log) {
            window.console.log(...args);
        }
    }

    trigger(event: string, data?: Object): void {
        this.log('fsm: (event)', event);

        const state = this.context.state;
        (this.states[state].events[event] || noop).call(this.context, data);

        // execute leave/enter callbacks if present and we have changed state
        if (state !== this.context.state || this.context.reloadState) {
            this.context.reloadState = false;
            this.onChangeState(state, this.context.state);
            (this.states[state].leave || noop).apply(this.context);
            (this.states[this.context.state].enter || noop).apply(this.context);

            this.log('fsm: (state)', `${state} -> ${this.context.state}`);
        }
    }
}

export default FiniteStateMachine;
