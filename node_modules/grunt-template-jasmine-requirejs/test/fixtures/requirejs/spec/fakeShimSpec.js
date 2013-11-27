define(['fakeShim'], function(fakeShim) {

  describe('Example fakeShim test', function() {

    describe('Shim works?', function(){

      it('Should get fake shim value rather than original', function(){
        expect(fakeShim).toEqual('this is fake shim');
      });

    });

  });

});
