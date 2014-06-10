/**@license MIT-promiscuous-©Ruben Verborgh*/
(function (func, obj) {
  // Type checking utility function
  function is(type, item) { return (typeof item)[0] == type; }

  // Creates a promise, calling callback(resolve, reject), ignoring other parameters.
  function Promise(callback, handler) {
    // The `handler` variable points to the function that will
    // 1) handle a .then(resolved, rejected) call
    // 2) handle a resolve or reject call (if the first argument === `is`)
    // Before 2), `handler` holds a queue of callbacks.
    // After 2), `handler` is a finalized .then handler.
    handler = function pendingHandler(resolved, rejected, value, queue, then, i) {
      queue = pendingHandler.q;

      // Case 1) handle a .then(resolved, rejected) call
      if (resolved != is) {
        return Promise(function (resolve, reject) {
          queue.push({ p: this, r: resolve, j: reject, 1: resolved, 0: rejected });
        });
      }

      // Case 2) handle a resolve or reject call
      // (`resolved` === `is` acts as a sentinel)
      // The actual function signature is
      // .re[ject|solve](<is>, success, value)

      // Check if the value is a promise and try to obtain its `then` method
      if (value && (is(func, value) | is(obj, value))) {
        try { then = value.then; }
        catch (reason) { rejected = 0; value = reason; }
      }
      // If the value is a promise, take over its state
      if (is(func, then)) {
        function valueHandler(resolved) {
          return function (value) { then && (then = 0, pendingHandler(is, resolved, value)); };
        }
        try { then.call(value, valueHandler(1), rejected = valueHandler(0)); }
        catch (reason) { rejected(reason); }
      }
      // The value is not a promise; handle resolve/reject
      else {
        // Replace this handler with a finalized resolved/rejected handler
        handler = function (Resolved, Rejected) {
          // If the Resolved or Rejected parameter is not a function,
          // return the original promise (now stored in the `callback` variable)
          if (!is(func, (Resolved = rejected ? Resolved : Rejected)))
            return callback;
          // Otherwise, return a finalized promise, transforming the value with the function
          return Promise(function (resolve, reject) { finalize(this, resolve, reject, value, Resolved); });
        };
        // Resolve/reject pending callbacks
        i = 0;
        while (i < queue.length) {
          then = queue[i++];
          // If no callback, just resolve/reject the promise
          if (!is(func, resolved = then[rejected]))
            (rejected ? then.r : then.j)(value);
          // Otherwise, resolve/reject the promise with the result of the callback
          else
            finalize(then.p, then.r, then.j, value, resolved);
        }
      }
    };
    // The queue of pending callbacks; garbage-collected when handler is resolved/rejected
    handler.q = [];

    // Create and return the promise (reusing the callback variable)
    callback.call(callback = { then:  function (resolved, rejected) { return handler(resolved, rejected); },
                               catch: function (rejected)           { return handler(0,        rejected); } },
                  function (value)  { handler(is, 1,  value); },
                  function (reason) { handler(is, 0, reason); });
    return callback;
  }

  // Finalizes the promise by resolving/rejecting it with the transformed value
  function finalize(promise, resolve, reject, value, transform) {
    setImmediate(function () {
      try {
        // Transform the value through and check whether it's a promise
        value = transform(value);
        transform = value && (is(obj, value) | is(func, value)) && value.then;
        // Return the result if it's not a promise
        if (!is(func, transform))
          resolve(value);
        // If it's a promise, make sure it's not circular
        else if (value == promise)
          reject(TypeError());
        // Take over the promise's state
        else
          transform.call(value, resolve, reject);
      }
      catch (error) { reject(error); }
    });
  }

  // Export the main module
  module.exports = Promise;

  // Creates a resolved promise
  Promise.resolve = ResolvedPromise;
  function ResolvedPromise(value) { return Promise(function (resolve) { resolve(value); }); }

  // Creates a rejected promise
  Promise.reject = function (reason) { return Promise(function (resolve, reject) { reject(reason); }); };

  // Transforms an array of promises into a promise for an array
  Promise.all = function (promises) {
    return Promise(function (resolve, reject, count, values) {
      // Array of collected values
      values = [];
      // Resolve immediately if there are no promises
      count = promises.length || resolve(values);
      // Transform all elements (`map` is shorter than `forEach`)
      promises.map(function (promise, index) {
        ResolvedPromise(promise).then(
          // Store the value and resolve if it was the last
          function (value) {
            values[index] = value;
            --count || resolve(values);
          },
          // Reject if one element fails
          reject);
      });
    });
  };
})('f', 'o');
