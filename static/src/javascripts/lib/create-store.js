// @flow
// Mini Redux
const createStore = (reducer, initialState) => {
    // We re-assign this over time
    let state = initialState;
    const subscribers = [];

    const notify = () => {
        subscribers.forEach(fn => {
            fn();
        });
    };
    const dispatch = action => {
        state = reducer(state, action);
        notify();
    };
    const subscribe = fn => {
        subscribers.push(fn);
    };
    const getState = () => state;

    dispatch({
        type: 'INIT',
    });

    return {
        dispatch,
        subscribe,
        getState,
    };
};

export default createStore;
