define(['common/utils/fastdom-promise'], function (fastdom) {
    // Mini Redux
    var createStore = function (reducer, initialState) {
        // We re-assign this over time
        var state = initialState;
        var subscribers = [];

        var notify = function () { subscribers.forEach(function (fn) { fn(); }); };
        var dispatch = function (action) {
            state = reducer(state, action);
            notify();
        };
        var subscribe = function (fn) { subscribers.push(fn); };
        var getState = function () { return state; };

        return {
            dispatch: dispatch,
            subscribe: subscribe,
            getState: getState
        };
    };

    var mountComponent = function (props) {
        var store = createStore(props.reducer, props.initialState);
        var update = function () {
            return fastdom.write(function () {
                props.render(store.getState());
            });
        };

        props.attachListeners(store.dispatch);

        // Initial update
        // Ensure we only start listening after the first update
        update().then(function () {
            // Update when actions occur
            store.subscribe(update);
        });
    };

    return mountComponent;
});
