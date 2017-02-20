if (typeof require === 'function' && typeof module === 'object') {
  var sinon = require('sinon');
  var jasmineSinon = require('../lib/jasmine-sinon.js');
}

describe('spy matchers', function() {
  beforeEach(function() {
    this.spy = sinon.spy();
  });

  describe('called/toHaveBeenCalled', function() {
    it('should not match when spy not called', function() {
      expect(this.spy.called).toBeFalsy();
      expect(this.spy).not.toHaveBeenCalled();
    });

    it('should match when spy called once', function() {
      this.spy();
      expect(this.spy.called).toBeTruthy();
      expect(this.spy).toHaveBeenCalled();
    });

    it('should match when spy called twice', function() {
      this.spy();
      this.spy();
      expect(this.spy.called).toBeTruthy();
      expect(this.spy).toHaveBeenCalled();
    });
  });

  describe('calledOnce/toHaveBeenCalledOnce', function() {
    it('should not match when spy not called', function() {
      expect(this.spy.calledOnce).toBeFalsy();
      expect(this.spy).not.toHaveBeenCalledOnce();
    });

    it('should match when spy called once', function() {
      this.spy();
      expect(this.spy.calledOnce).toBeTruthy();
      expect(this.spy).toHaveBeenCalledOnce();
    });

    it('should not match when spy called twice', function() {
      this.spy();
      this.spy();
      expect(this.spy.calledOnce).toBeFalsy();
      expect(this.spy).not.toHaveBeenCalledOnce();
    });
  });

  describe('calledTwice/toHaveBeenCalledTwice', function() {
    it('should not match when spy not called', function() {
      expect(this.spy.calledTwice).toBeFalsy();
      expect(this.spy).not.toHaveBeenCalledTwice();
    });

    it('should not match when spy called once', function() {
      this.spy();
      expect(this.spy.calledTwice).toBeFalsy();
      expect(this.spy).not.toHaveBeenCalledTwice();
    });

    it('should match when spy called twice', function() {
      this.spy();
      this.spy();
      expect(this.spy.calledTwice).toBeTruthy();
      expect(this.spy).toHaveBeenCalledTwice();
    });

    it('should not match when spy called thrice', function() {
      this.spy();
      this.spy();
      this.spy();
      expect(this.spy.calledTwice).toBeFalsy();
      expect(this.spy).not.toHaveBeenCalledTwice();
    });
  });

  describe('calledThrice/toHaveBeenCalledThrice', function() {
    it('should not match when spy not called', function() {
      expect(this.spy.calledThrice).toBeFalsy();
      expect(this.spy).not.toHaveBeenCalledThrice();
    });

    it('should not match when spy called once', function() {
      this.spy();
      expect(this.spy.calledThrice).toBeFalsy();
      expect(this.spy).not.toHaveBeenCalledThrice();
    });

    it('should not match when spy called twice', function() {
      this.spy();
      this.spy();
      expect(this.spy.calledThrice).toBeFalsy();
      expect(this.spy).not.toHaveBeenCalledThrice();
    });

    it('should match when spy called thrice', function() {
      this.spy();
      this.spy();
      this.spy();
      expect(this.spy.calledThrice).toBeTruthy();
      expect(this.spy).toHaveBeenCalledThrice();
    });

    it('should not match when spy called four times', function() {
      this.spy();
      this.spy();
      this.spy();
      this.spy();
      expect(this.spy.calledThrice).toBeFalsy();
      expect(this.spy).not.toHaveBeenCalledThrice();
    });
  });

  describe('calledBefore/After - toHaveBeenCalledBefore/After', function() {
    beforeEach(function() {
      this.spyA = sinon.spy();
      this.spyB = sinon.spy();
    });

    describe('calledBefore / toHaveBeenCalledBefore', function() {
      it('should match when spy a called before spy b', function() {
        this.spyA();
        this.spyB();
        expect(this.spyA.calledBefore(this.spyB)).toBeTruthy();
        expect(this.spyA).toHaveBeenCalledBefore(this.spyB);
      });

      it('should not match when spy a called after spy b', function() {
        this.spyB();
        this.spyA();
        expect(this.spyA.calledBefore(this.spyB)).toBeFalsy();
        expect(this.spyA).not.toHaveBeenCalledBefore(this.spyB);
      });
    });

    describe('calledAfter / toHaveBeenCalledAfter', function() {
      it('should match when spy a called after spy b', function() {
        this.spyA();
        this.spyB();
        expect(this.spyB.calledAfter(this.spyA)).toBeTruthy();
        expect(this.spyB).toHaveBeenCalledAfter(this.spyA);
      });

      it('should not match when spy a called before spy b', function() {
        this.spyB();
        this.spyA();
        expect(this.spyB.calledAfter(this.spyA)).toBeFalsy();
        expect(this.spyB).not.toHaveBeenCalledAfter(this.spyA);
      });
    });
  });

  describe('calledOn/toHaveBeenCalledOn', function() {
    it('should match when spy called on expected object', function() {
      var obj = {
        toString: function() {
          return 'my object'
        }
      };
      expect(this.spy.calledOn(obj)).toBeFalsy();
      expect(this.spy).not.toHaveBeenCalledOn(obj);
      this.spy.call(obj);
      expect(this.spy.calledOn(obj)).toBeTruthy();
      expect(this.spy).toHaveBeenCalledOn(obj);
    });
  });

  describe('alwaysCalledOn/toHaveAlwaysBeenCalledOn/toHaveBeenAlwaysCalledOn', function() {
    it('should match when spy always called on expected object', function() {
      this.spy.call(this);
      this.spy.call(this);
      expect(this.spy.alwaysCalledOn(this)).toBeTruthy();
      expect(this.spy).toHaveBeenAlwaysCalledOn(this);
    });

    it('should not match when spy called with other object', function() {
      this.spy.call(this);
      this.spy.call({});
      expect(this.spy.alwaysCalledOn(this)).toBeFalsy();
      expect(this.spy).not.toHaveBeenAlwaysCalledOn(this);
    });
  });

  describe('calledWith/toHaveBeenCalledWith', function() {
    it('should match when spy called with argument', function() {
      this.spy('arg1');
      expect(this.spy.calledWith('arg1')).toBeTruthy();
      expect(this.spy).toHaveBeenCalledWith('arg1');
    });

    it('should not match when spy called with different arguments', function() {
      this.spy('arg1');
      expect(this.spy.calledWith('arg2')).toBeFalsy();
      expect(this.spy).not.toHaveBeenCalledWith('arg2');
    });
  });

  describe('alwaysCalledWith/toHaveBeenAlwaysCalledWith', function() {
    it('should match when spy always called with argument', function() {
      this.spy('arg1');
      this.spy('arg1', 'arg2');
      expect(this.spy.alwaysCalledWith('arg1')).toBeTruthy();
      expect(this.spy).toHaveBeenAlwaysCalledWith('arg1');
    });

    it('should not match when spy not always called with argument', function() {
      this.spy('arg1');
      this.spy('arg2');
      expect(this.spy.alwaysCalledWith('arg1')).toBeFalsy();
      expect(this.spy).not.toHaveBeenAlwaysCalledWith('arg');
    });
  });

  describe('calledWithExactly/toHaveBeenCalledWithExactly', function() {
    it('should match when spy called with exact argument set', function() {
      this.spy('arg1', 'arg2');
      expect(this.spy.calledWithExactly('arg1', 'arg2')).toBeTruthy();
      expect(this.spy).toHaveBeenCalledWithExactly('arg1', 'arg2');
    });

    it('should not match when spy called with different argument set', function() {
      this.spy('arg1', 'arg2', 'arg3');
      expect(this.spy.calledWithExactly('arg1', 'arg2')).toBeFalsy();
      expect(this.spy).not.toHaveBeenCalledWithExactly('arg1', 'arg2');
    });
  });

  describe('alwaysCalledWithExactly/toHaveBeenAlwaysCalledWithExactly', function() {
    it('should match when spy always called with exact argument set', function() {
      this.spy('arg1', 'arg2');
      this.spy('arg1', 'arg2');
      expect(this.spy.alwaysCalledWithExactly('arg1','arg2')).toBeTruthy();
      expect(this.spy).toHaveBeenAlwaysCalledWithExactly('arg1','arg2');
    });

    it('should not match when spy called with differing argument set', function() {
      this.spy('arg1', 'arg2');
      this.spy('arg1', 'arg2', 'arg3');
      expect(this.spy.alwaysCalledWithExactly('arg1','arg2')).toBeFalsy();
      expect(this.spy).not.toHaveBeenAlwaysCalledWithExactly('arg1','arg2');
    });
  });

  describe('calledWithMatch/toHaveBeenCalledWithMatch', function() {
    it('should match when spy called with arguments that match', function() {
      this.spy({arg1:'one', arg2:'two'});
      expect(this.spy.calledWithMatch({arg1:'one'})).toBeTruthy();
      expect(this.spy).toHaveBeenCalledWithMatch({arg1:'one'});
      expect(this.spy.calledWithMatch({arg2:'two'})).toBeTruthy();
      expect(this.spy).toHaveBeenCalledWithMatch({arg2:'two'});
    });

    it('should not match when spy called with different argument', function() {
      this.spy({arg1:'one', arg2:'two'});
      expect(this.spy.calledWithMatch({arg1:'two'})).toBeFalsy();
      expect(this.spy).not.toHaveBeenCalledWithMatch({arg1:'two'});
      expect(this.spy.calledWithMatch({arg1:'two', arg2:'two'})).toBeFalsy();
      expect(this.spy).not.toHaveBeenCalledWithMatch({arg1:'two', arg2:'two'});
    });
  });

  describe('alwaysCalledWithMatch/toHaveBeenAlwaysCalledWithMatch', function() {
    it('should match when spy always called with matching arguments set', function() {
      this.spy({arg1:'one', arg2:'two'});
      this.spy({arg1:'one', arg2:'two'});
      expect(this.spy.alwaysCalledWithMatch({arg1:'one'})).toBeTruthy();
      expect(this.spy).toHaveBeenAlwaysCalledWithMatch({arg1:'one'});
      expect(this.spy.alwaysCalledWithMatch({arg2:'two'})).toBeTruthy();
      expect(this.spy).toHaveBeenAlwaysCalledWithMatch({arg2:'two'});
      expect(this.spy.alwaysCalledWithMatch({arg1:'one', arg2:'two'})).toBeTruthy();
      expect(this.spy).toHaveBeenAlwaysCalledWithMatch({arg1:'one', arg2:'two'});
    });

    it('should not match when spy called with differing argument set', function() {
      this.spy({arg1:'one', arg2:'two'});
      this.spy({arg1:'one', arg2:'one'});
      expect(this.spy.alwaysCalledWithMatch({arg1:'one', arg2:'two'})).toBeFalsy();
      expect(this.spy).not.toHaveBeenAlwaysCalledWithMatch({arg1:'one', arg2:'two'});
      expect(this.spy.alwaysCalledWithMatch({arg1:'one'})).toBeTruthy();
      expect(this.spy).toHaveBeenAlwaysCalledWithMatch({arg1:'one'});
      expect(this.spy.alwaysCalledWithMatch({arg2:'two'})).toBeFalsy();
      expect(this.spy).not.toHaveBeenAlwaysCalledWithMatch({arg2:'two'});
    });
  });

  describe('calledWithNew', function() {
    it('should match when spy called with new operator', function() {
      var newSpy = new this.spy();
      expect(this.spy.calledWithNew()).toBeTruthy();
      expect(this.spy).toHaveBeenCalledWithNew();
    });

    it('should not match when spy not called with new', function() {
      this.spy();
      expect(this.spy.calledWithNew()).toBeFalsy();
      expect(this.spy).not.toHaveBeenCalledWithNew();
    })
  });

  describe('neverCalledWith', function() {
    it('should match when the spy was never called with the argument', function() {
      this.spy('foo');
      this.spy('bar');
      expect(this.spy.neverCalledWith('baz')).toBeTruthy();
      expect(this.spy).toHaveBeenNeverCalledWith('baz');
    });

    it('should not match when the spy was called with the argument', function() {
      this.spy('foo');
      this.spy('bar');
      this.spy('baz');
      expect(this.spy.neverCalledWith('baz')).toBeFalsy();
      expect(this.spy).not.toHaveBeenNeverCalledWith('baz'); // OMG YUCK
    });
  });

  describe('neverCalledWithMatch', function() {
    it('should match when the spy was never called with matching arguments', function() {
      var obj = {foo: '1', bar: '2'};
      this.spy(obj);
      expect(this.spy.neverCalledWithMatch({baz: '1'})).toBeTruthy();
      expect(this.spy).toHaveBeenNeverCalledWithMatch({baz: '1'});
    });

    it('should not match when the spy was called with matching arguments', function() {
      var obj = {foo: '1', bar: '2'};
      this.spy(obj);
      expect(this.spy.neverCalledWithMatch({foo: '1'})).toBeFalsy();
      expect(this.spy).not.toHaveBeenNeverCalledWithMatch({foo:'1'});
    });
  });

  describe('threw/toHaveThrown', function() {
    beforeEach(function() {
      this.spy = sinon.spy.create();

      this.spyWithTypeError = sinon.spy.create(function () {
        throw new TypeError();
      });
    });

    it('should match exception thrown by function', function() {
      var err = new Error();

      var spy = sinon.spy.create(function () {
        throw err;
      });

      try {
        spy();
      } catch (e) {}

      expect(spy.threw(err)).toBeTruthy();
      expect(spy).toHaveThrown(err);
    });

    it('should match when spy threw exception', function() {
      try {
        this.spyWithTypeError();
      } catch(e) {}

      expect(this.spyWithTypeError.threw()).toBeTruthy();
      expect(this.spyWithTypeError).toHaveThrown();
    });

    it('should not match when spy did not throw', function() {
      this.spy();
      expect(this.spy.threw()).toBeFalsy();
      expect(this.spy).not.toHaveThrown();
    });

    it('should match when string type matches', function() {
      try {
        this.spyWithTypeError();
      } catch(e) {}

      expect(this.spyWithTypeError.threw('TypeError')).toBeTruthy();
      expect(this.spyWithTypeError).toHaveThrown('TypeError');
    });

    it('should not match when string did not match', function() {
      try {
        this.spyWithTypeError();
      } catch(e) {}

      expect(this.spyWithTypeError.threw('Error')).toBeFalsy();
      expect(this.spyWithTypeError).not.toHaveThrown('Error');
    });

    it('should not match when spy did not throw specified error', function() {
      this.spy();
      expect(this.spy.threw('TypeError')).toBeFalsy();
      expect(this.spy).not.toHaveThrown('TypeError');
    });
  });

  describe('alwaysThrew/toHaveAlwaysThrown', function() {
    beforeEach(function() {
      this.spy = sinon.spy.create();

      this.spyWithTypeError = sinon.spy.create(function () {
        throw new TypeError();
      });
    });

    it('should match exception thrown by function', function() {
      var err = new Error();

      var spy = sinon.spy.create(function () {
        throw err;
      });

      try {
        spy();
      } catch (e) {}

      expect(spy.alwaysThrew(err)).toBeTruthy();
      expect(spy).toHaveAlwaysThrown(err);
    });

    it('should match when spy threw exception', function() {
      try {
        this.spyWithTypeError();
      } catch(e) {}

      expect(this.spyWithTypeError.alwaysThrew()).toBeTruthy();
      expect(this.spyWithTypeError).toHaveAlwaysThrown();
    });

    it('should not match when spy did not throw', function() {
      this.spy();
      expect(this.spy.alwaysThrew()).toBeFalsy();
      expect(this.spy).not.toHaveAlwaysThrown();
    });

    it('should match when string type matches', function() {
      try {
        this.spyWithTypeError();
      } catch(e) {}

      expect(this.spyWithTypeError.alwaysThrew('TypeError')).toBeTruthy();
      expect(this.spyWithTypeError).toHaveAlwaysThrown('TypeError');
    });

    it('should not match when string did not match', function() {
      try {
        this.spyWithTypeError();
      } catch(e) {}

      expect(this.spyWithTypeError.alwaysThrew('Error')).toBeFalsy();
      expect(this.spyWithTypeError).not.toHaveAlwaysThrown('Error');
    });

    it('should not match when spy did not throw specified error', function() {
      this.spy();
      expect(this.spy.alwaysThrew('TypeError')).toBeFalsy();
      expect(this.spy).not.toHaveAlwaysThrown('TypeError');
    });

    it('should not match when some calls did not throw', function() {
      var spy = sinon.spy.create(function () {
        if (spy.callCount === 0) {
          throw new Error();
        }
      });

      try {
        spy();
      } catch (e) {}

      spy();

      expect(spy.alwaysThrew()).toBeFalsy();
      expect(spy).not.toHaveAlwaysThrown();
    });

    it('should match when all calls threw exception', function() {
      try {
        this.spyWithTypeError();
      } catch(e) {}

      try {
        this.spyWithTypeError();
      } catch(e) {}

      expect(this.spyWithTypeError.alwaysThrew()).toBeTruthy();
      expect(this.spyWithTypeError).toHaveAlwaysThrown();
    });

    it('should match when all calls threw same type', function() {
      try {
        this.spyWithTypeError();
      } catch(e) {}

      try {
        this.spyWithTypeError();
      } catch(e) {}

      expect(this.spyWithTypeError.alwaysThrew('TypeError')).toBeTruthy();
      expect(this.spyWithTypeError).toHaveAlwaysThrown('TypeError');
    });
  });

  describe('returned/toHaveReturned', function() {
    it('should match when spy returned value', function() {
      var spy = sinon.spy.create(function() {
        return 1;
      });
      spy();
      expect(spy.returned(1)).toBeTruthy();
      expect(spy).toHaveReturned(1);
    });

    it('should match when spy returned value amongst others', function() {
      var values = [1,2,3];
      var spy = sinon.spy.create(function() {
        return values[spy.callCount];
      });
      spy();
      spy();
      expect(spy.returned(3)).toBeTruthy();
      expect(spy).toHaveReturned(3);
    });

    it('should not match when spy did not return value', function() {
      var spy = sinon.spy();
      spy();
      expect(spy.returned(1)).toBeFalsy();
      expect(spy).not.toHaveReturned(1);
    });
  });

  describe('alwaysReturned/toHaveAlwaysReturned', function() {
    it('should match when spy always return value', function() {
      var spy = sinon.spy.create(function() {
        return 1;
      });
      spy();
      spy();
      expect(spy.alwaysReturned(1)).toBeTruthy();
      expect(spy).toHaveAlwaysReturned(1);
    });

    it('should not match when spy did not always return value', function() {
      var values = [1,2,3];
      var spy = sinon.spy.create(function() {
        return values[spy.callCount];
      });
      spy();
      spy();
      expect(spy.alwaysReturned(3)).toBeFalsy();
      expect(spy).not.toHaveAlwaysReturned(3);
    });

    it('should not match when spy did not return value', function() {
      var spy = sinon.spy();
      spy();
      expect(spy.alwaysReturned(1)).toBeFalsy();
      expect(spy).not.toHaveAlwaysReturned(1);
    });
  });
});
