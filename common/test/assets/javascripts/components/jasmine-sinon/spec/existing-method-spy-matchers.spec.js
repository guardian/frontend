if (typeof require === 'function' && typeof module === 'object') {
  var sinon = require('sinon');
  var jasmineSinon = require('../lib/jasmine-sinon.js');
}

describe('existing method spy matchers', function() {
  beforeEach(function() {
    this.methodVal = 'no';
    this.api = {
      myMethod: function(val) {
        this.methodVal = val;
      }
    };
    this.spy = sinon.spy(this.api, 'myMethod');
  });

  describe('boolean matcher example', function() {
    it('should retain spy\'s original functionality', function() {
      expect(this.methodVal).toEqual('no');
      expect(this.spy).not.toHaveBeenCalled();
      this.api.myMethod.call(this, 'yes');
      expect(this.methodVal).toEqual('yes');
      expect(this.spy).toHaveBeenCalled();
    });
  });

  describe('method matcher example', function() {
    it('should retain spy\'s original functionality', function() {
      expect(this.methodVal).toEqual('no');
      expect(this.spy).not.toHaveBeenCalledOn(this);
      this.api.myMethod.call(this, 'yes');
      expect(this.methodVal).toEqual('yes');
      expect(this.spy).toHaveBeenCalledOn(this);
    });
  });
});
