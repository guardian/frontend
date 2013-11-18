define(function (require) {
  describe('Module', function () {

    it('should require app module with baseUrl set', function() {
      var app = require('app');
      expect(app).toBeDefined();
      expect(app.fixture).toBe('require-baseurl'); // sanity check
      expect(app.isStarted()).toBe(false);
    });

  });
});
