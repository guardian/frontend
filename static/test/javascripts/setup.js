// This is the equivalent of the old waitsFor/runs syntax
// which was removed from Jasmine 2
waitsForAndRuns = function(escapeFunction, runFunction, escapeTime) {
    // check the escapeFunction every millisecond so as soon as it is met we can escape the function
    var interval = setInterval(function() {
        if (escapeFunction()) {
            clearMe();
            runFunction();
        }
    }, 1);

    // in case we never reach the escapeFunction, we will time out
    // at the escapeTime
    var timeOut = setTimeout(function() {
        clearMe();
        runFunction();
    }, escapeTime || 5000);

    // clear the interval and the timeout
    function clearMe(){
        clearInterval(interval);
        clearTimeout(timeOut);
    }
};

// adding the 'withCredentials' property, so reqwest thinks it can do cors
sinon.FakeXMLHttpRequest.prototype.withCredentials = false;

// Silly phantomJS doesn't have this yetz
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

window.guardian = {
    config: {
        switches: { },
        page: { }
    }
};
window.s_account = 'guardiangu-frontend,guardiangu-network';
