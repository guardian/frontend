if (typeof require === 'function' && typeof module === 'object') {
  var sinon = require('sinon');
  var jasmineSinon = require('../lib/jasmine-sinon.js');
}

describe('jasmine matcher', function() {
  it('jasmine.any() is supported', function () {
    var spy = sinon.spy();
    spy('abc');
    spy(new Date());
    expect(spy).toHaveBeenCalledWith(jasmine.any(String));
    expect(spy).toHaveBeenCalledWith(jasmine.any(Date));
    expect(spy).not.toHaveBeenCalledWith(jasmine.any(Number));
  });

  it('jasmine.objectContaining()', function () {
    var spy = sinon.spy();
    spy({
      a: 1,
      b: 2,
      c: 3
    });
    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({b: 2}));
    expect(spy).not.toHaveBeenCalledWith(jasmine.objectContaining({b: 1}));
  });
});
