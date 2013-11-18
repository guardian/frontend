
describe('Example AMD test', function(){
  var math = require('math');

  describe('Sum', function(){
    it('Should add two numbers together', function(){
      expect(math.sum(2,10)).toEqual(12);
    })
  })
});