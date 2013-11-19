if (typeof require === 'function' && typeof module === 'object') {
  var sinon = require('sinon');
  var jasmineSinon = require('../lib/jasmine-sinon.js');
}

describe('test stubs', function() {
  beforeEach(function() {
    this.anonStub = sinon.stub();
    this.api = {
      foo: function() {
        return 'bar';
      }
    };
    this.methodStub = sinon.stub(this.api,'foo');
  });

  describe('inherit spy matchers', function() {
    describe('boolean matcher examples', function() {
      it('should return true when anonymous stub was called', function() {
        this.anonStub();
        expect(this.anonStub.called).toBeTruthy();
        expect(this.anonStub).toHaveBeenCalled();
      });

      it('should return true when method stub was called', function() {
        this.api.foo();
        expect(this.methodStub.called).toBeTruthy();
        expect(this.methodStub).toHaveBeenCalled();
      });

      it('should return false when stubs were not called', function() {
        expect(this.anonStub.called).toBeFalsy();
        expect(this.anonStub).not.toHaveBeenCalled();
        expect(this.methodStub.called).toBeFalsy();
        expect(this.methodStub).not.toHaveBeenCalled();
      });
    });

    describe('method matcher examples', function() {
      it('should return true when anonymous stub called with scope', function() {
        this.anonStub.call(this);
        expect(this.anonStub.calledOn(this)).toBeTruthy();
        expect(this.anonStub).toHaveBeenCalledOn(this);
      });

      it('should return true when method stub was called with scope', function() {
        this.api.foo.call(this);
        expect(this.methodStub.calledOn(this)).toBeTruthy();
        expect(this.methodStub).toHaveBeenCalledOn(this);
      });
    });
  });
});
