define(function (require) {
  describe('Module', function () {

    it('should require app module relative to Gruntfile location', function() {
      var app = require('test/fixtures/require-nobaseurl/src/app');
      expect(app).toBeDefined();
      expect(app.fixture).toBe('require-nobaseurl'); // sanity check
      expect(app.isStarted()).toBe(false);
    });

  });
});
