define([], function () {
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

        dispatch({ type: 'INIT' });

        return {
            dispatch: dispatch,
            subscribe: subscribe,
            getState: getState
        };
    };

    return createStore;
});
