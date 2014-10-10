if (typeof require === 'function' && typeof module === 'object') {
  var sinon = require('sinon');
  var jasmineSinon = require('../lib/jasmine-sinon.js');
}

describe('message factories', function() {
  beforeEach(function () {
    this.spy = sinon.spy(function mySpy() {});
  });

  describe('#spy', function () {
    beforeEach(function () {
      this.subject = jasmine.jasmineSinon.messageFactories.spy('to have been called');
    });

    it('formats the message correctly', function () {
      expect(this.subject(false, this.spy)).toEqual('Expected spy "mySpy" to have been called.');
    });

    it('formats the message correctly with "not"', function () {
      expect(this.subject(true, this.spy)).toEqual('Expected spy "mySpy" not to have been called.');
    });
  });

  describe('#spyWithCallCount', function () {
    beforeEach(function () {
      this.subject = jasmine.jasmineSinon.messageFactories.spyWithCallCount('to have been called once');
      this.spy();
    });

    it('formats the message correctly', function () {
      expect(this.subject(false, this.spy)).
        toEqual('Expected spy "spy" to have been called once. "spy" was called once.');
    });

    it('formats the message correctly with "not"', function () {
      expect(this.subject(true, this.spy)).
        toEqual('Expected spy "spy" not to have been called once. "spy" was called once.');
    });
  });

  describe('#spyWithOtherArgs', function () {
    beforeEach(function () {
      this.subject = jasmine.jasmineSinon.messageFactories.spyWithOtherArgs('to have been called with');
      this.otherArgs = ['a', { foo: 'bar' }];
    });

    it('formats the message correctly', function () {
      expect(this.subject(false, this.spy, this.otherArgs)).
        toEqual('Expected spy "mySpy" to have been called with [ \'a\', { foo : \'bar\' } ]');
    });

    it('formats the message correct with "not"', function () {
      expect(this.subject(true, this.spy, this.otherArgs)).
        toEqual('Expected spy "mySpy" not to have been called with [ \'a\', { foo : \'bar\' } ]');
    });
  });
});
