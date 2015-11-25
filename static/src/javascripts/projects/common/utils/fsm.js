define([], function () {

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

    function FiniteStateMachine(options) {
        this.context = options.context || undefined;
        this.states = options.states || {};
        this.context.state = options.initial || '';
        this.debug = options.debug || false;
        this.onChangeState = options.onChangeState.bind(this.context) || function () {};
    }

    FiniteStateMachine.prototype.log = function () {
        if (this.debug && window.console && window.console.log) {
            window.console.log.apply(window.console, arguments);
        }
    };

    FiniteStateMachine.prototype.trigger = function (event, data) {

        this.log('fsm: (event)', event);

        var state = this.context.state,
            noop = function () {};

        (this.states[state].events[event] || noop).call(this.context, data);

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
