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

guardian = {
    config: {
        beaconUrl: '',
        stripePublicToken: "testToken123",
        switches: {},
        page: {
            tones: 'foo',
            series: 'bar',
            references: [{baz: 'one'}, {baz: 'two'}],
            webPublicationDate: '2013-03-20T17:07:00.000Z'
        }
    }
};

require(['common/utils/ajax'], function(ajax) {
    ajax.init();
});
