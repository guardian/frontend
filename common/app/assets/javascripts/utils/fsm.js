define([], function() {

    /*
        simple practical and flexible "finite state machine" implementation

        example config object: (see gallery/lightbox.js for a working example)
        var config = {
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

    function FiniteStateMachine(config) {
        this.context = config.context || undefined;
        this.states = config.states || {};
        this.context.state = config.initial || '';
        this.debug = config.debug || false;
        this.onChangeState = config.onChangeState.bind(this.context) || function() {};
        this.onChangeState('', this.context.state);
    }

    FiniteStateMachine.prototype.log = function() {
        if (this.debug && window.console) {
            window.console.log.apply(window.console, arguments);
        }
    };

    FiniteStateMachine.prototype.trigger = function(event) {

        this.log('fsm: (event)', event);

        var state = this.context.state,
            noop = function() {};

        (this.states[state].events[event] || noop).apply(this.context);

        // execute leave/enter callbacks if present and we have changed state
        if (state !== this.context.state || this.context.reloadState) {
            this.context.reloadState = false;
            this.onChangeState(state, this.context.state);
            (this.states[state].leave || noop).apply(this.context);
            (this.states[this.context.state].enter || noop).apply(this.context);

            this.log('fsm: (state)', state + ' -> ' + this.context.state);
        }
    };

    return FiniteStateMachine;
});