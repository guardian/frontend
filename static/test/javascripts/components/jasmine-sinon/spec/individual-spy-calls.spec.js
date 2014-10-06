if (typeof require === 'function' && typeof module === 'object') {
  var sinon = require('sinon');
  var jasmineSinon = require('../lib/jasmine-sinon.js');
}

describe('individual spy calls', function() {
  beforeEach(function() {
    this.spy = sinon.spy();
  });

  describe('calledOn/toHaveBeenCalledOn', function() {
    var a = { foo: 'bar' }, b = { bar: 'foo' };

    it('should return true if obj was scope for call', function() {
      this.spy.call(a);
      var spyCall = this.spy.getCall(0);
      expect(spyCall.calledOn(a)).toBeTruthy();
      expect(spyCall).toHaveBeenCalledOn(a);
    });

    it('should not return true if scope was something else', function() {
      this.spy.call(b);
      var spyCall = this.spy.getCall(0);
      expect(spyCall.calledOn(a)).toBeFalsy();
      expect(spyCall).not.toHaveBeenCalledOn(a);
    });
  });

  describe('calledWith/toHaveBeenCalledWith', function() {
    it('should return true if call received arguments', function() {
      this.spy('foo', 'bar');
      var spyCall = this.spy.getCall(0);
      expect(spyCall.calledWith('foo', 'bar')).toBeTruthy();
      expect(spyCall).toHaveBeenCalledWith('foo', 'bar');
    });

    it('should not return true if call did not receive arguments', function() {
      this.spy('fooble', 'barble');
      var spyCall = this.spy.getCall(0);
      expect(spyCall.calledWith('foo','bar')).toBeFalsy();
      expect(spyCall).not.toHaveBeenCalledWith('foo','bar');
    });
  });

  describe('calledWithExactly/toHaveBeenCalledWithExactly', function() {
    it('should return true if received provided arguments and no others', function() {
      this.spy('foo','bar');
      var spyCall = this.spy.getCall(0);
      expect(spyCall.calledWithExactly('foo','bar')).toBeTruthy();
      expect(spyCall).toHaveBeenCalledWithExactly('foo','bar');
    });
  });
  // TODO individual spy call exception matchers
});
