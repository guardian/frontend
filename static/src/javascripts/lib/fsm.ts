import { noop } from './noop';

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

type OnChangeState = (oldState: string, newState: string) => void;
type States = Record<
	string,
	{
		enter?: () => void;
		leave?: () => void;
		events?: Record<string, () => void>;
	}
>;
type Context = {
	state: string;
	[x: string]: unknown;
};

class FiniteStateMachine {
	context: Context;
	states: States;
	debug: boolean | null;
	onChangeState: OnChangeState;

	constructor(options: {
		context: Context;
		states?: States;
		initial?: string;
		debug?: boolean;
		onChangeState?: OnChangeState;
	}) {
		this.context = options.context;
		this.states = options.states ?? {};
		this.context.state = options.initial ?? '';
		this.debug = options.debug ?? false;
		this.onChangeState = options.onChangeState?.bind(this.context) ?? noop;
	}

	log(...args: string[]): void {
		if (this.debug) {
			window.console.log(...args);
		}
	}

	trigger(event: string, data?: Record<string, unknown>): void {
		this.log('fsm: (event)', event);

		const state = this.context.state;
		(this.states[state].events?.[event] ?? noop).call(this.context, data);

		// execute leave/enter callbacks if present and we have changed state
		if (state !== this.context.state || this.context.reloadState) {
			this.context.reloadState = false;
			this.onChangeState(state, this.context.state);
			(this.states[state].leave ?? noop).apply(this.context);
			(this.states[this.context.state].enter ?? noop).apply(this.context);

			this.log('fsm: (state)', `${state} -> ${this.context.state}`);
		}
	}
}

export { FiniteStateMachine };
