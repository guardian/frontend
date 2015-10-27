if (typeof require === 'function' && typeof module === 'object') {
  var sinon = require('sinon');
  var jasmineSinon = require('../lib/jasmine-sinon.js');
}

describe('jasmine matchers gracefully overridden', function() {
  beforeEach(function() {
    this.methodVal = 'no';
    this.api = {
      myMethod: function(val) {
        this.methodVal = val;
      }
    };
    spyOn(this.api, 'myMethod').and.callThrough();
  });

  describe('toHaveBeenCalled', function() {
    it('should work for jasmine spy', function() {
      expect(this.methodVal).toEqual('no');
      expect(this.api.myMethod).not.toHaveBeenCalled();
      this.api.myMethod.call(this, 'yes');
      expect(this.methodVal).toEqual('yes');
      expect(this.api.myMethod).toHaveBeenCalled();
    });
  });

  describe('toHaveBeenCalledWith', function() {
    it('should work for jasmine spy', function() {
      expect(this.methodVal).toEqual('no');
      expect(this.api.myMethod).not.toHaveBeenCalledWith('yes');
      this.api.myMethod.call(this, 'yes');
      expect(this.methodVal).toEqual('yes');
      expect(this.api.myMethod).toHaveBeenCalledWith('yes');
    });
  });
});
