define(['inlineModule'], function(inlineModule) {

  describe('Example inline module test', function() {

    describe('Inline module works?', function(){

      it('Should get returned value from inline module', function(){
        expect(inlineModule).toEqual('this is inline module');
      });

    });

  });

});
