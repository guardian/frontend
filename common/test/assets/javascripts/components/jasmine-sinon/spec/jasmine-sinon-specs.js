describe("jasmine-sinon", function() {
  
  describe("spy matchers", function() {
    
    beforeEach(function() {
      this.spy = sinon.spy();
    });
    
    describe("called/toHaveBeenCalled", function() {
      
      it("should not match when spy not called", function() {
        expect(this.spy.called).toBeFalsy();
        expect(this.spy).not.toHaveBeenCalled();
      });
      
      it("should match when spy called once", function() {
        this.spy();
        expect(this.spy.called).toBeTruthy();
        expect(this.spy).toHaveBeenCalled();
      });
      
      it("should match when spy called twice", function() {
        this.spy();
        this.spy();
        expect(this.spy.called).toBeTruthy();
        expect(this.spy).toHaveBeenCalled();
      });
      
    });
    
    describe("calledOnce/toHaveBeenCalledOnce", function() {
      
      it("should not match when spy not called", function() {
        expect(this.spy.calledOnce).toBeFalsy();
        expect(this.spy).not.toHaveBeenCalledOnce();
      });
      
      it("should match when spy called once", function() {
        this.spy();
        expect(this.spy.calledOnce).toBeTruthy();
        expect(this.spy).toHaveBeenCalledOnce();
      });
      
      it("should not match when spy called twice", function() {
        this.spy();
        this.spy();
        expect(this.spy.calledOnce).toBeFalsy();
        expect(this.spy).not.toHaveBeenCalledOnce();
      });
      
    });
    
    describe("calledTwice/toHaveBeenCalledTwice", function() {
      
      it("should not match when spy not called", function() {
        expect(this.spy.calledTwice).toBeFalsy();
        expect(this.spy).not.toHaveBeenCalledTwice();
      });
      
      it("should not match when spy called once", function() {
        this.spy();
        expect(this.spy.calledTwice).toBeFalsy();
        expect(this.spy).not.toHaveBeenCalledTwice();
      });
      
      it("should match when spy called twice", function() {
        this.spy();
        this.spy();
        expect(this.spy.calledTwice).toBeTruthy();
        expect(this.spy).toHaveBeenCalledTwice();
      });
      
      it("should not match when spy called thrice", function() {
        this.spy();
        this.spy();
        this.spy();
        expect(this.spy.calledTwice).toBeFalsy();
        expect(this.spy).not.toHaveBeenCalledTwice();
      });
      
    });
    
    describe("calledThrice/toHaveBeenCalledThrice", function() {
      
      it("should not match when spy not called", function() {
        expect(this.spy.calledThrice).toBeFalsy();
        expect(this.spy).not.toHaveBeenCalledThrice();
      });
      
      it("should not match when spy called once", function() {
        this.spy();
        expect(this.spy.calledThrice).toBeFalsy();
        expect(this.spy).not.toHaveBeenCalledThrice();
      });
      
      it("should not match when spy called twice", function() {
        this.spy();
        this.spy();
        expect(this.spy.calledThrice).toBeFalsy();
        expect(this.spy).not.toHaveBeenCalledThrice();
      });
      
      it("should match when spy called thrice", function() {
        this.spy();
        this.spy();
        this.spy();
        expect(this.spy.calledThrice).toBeTruthy();
        expect(this.spy).toHaveBeenCalledThrice();
      });
      
      it("should not match when spy called four times", function() {
        this.spy();
        this.spy();
        this.spy();
        this.spy();
        expect(this.spy.calledThrice).toBeFalsy();
        expect(this.spy).not.toHaveBeenCalledThrice();
      });
      
    });
    
    describe("calledBefore/After - toHaveBeenCalledBefore/After", function() {
      
      beforeEach(function() {
        this.spyA = sinon.spy();
        this.spyB = sinon.spy();
      });
      
      describe("calledBefore / toHaveBeenCalledBefore", function() {
        it("should match when spy a called before spy b", function() {
          this.spyA();
          this.spyB();
          expect(this.spyA.calledBefore(this.spyB)).toBeTruthy();
          expect(this.spyA).toHaveBeenCalledBefore(this.spyB);
        });

        it("should not match when spy a called after spy b", function() {
          this.spyB();
          this.spyA();
          expect(this.spyA.calledBefore(this.spyB)).toBeFalsy();
          expect(this.spyA).not.toHaveBeenCalledBefore(this.spyB);
        });
      });
      
      describe("calledAfter / toHaveBeenCalledAfter", function() {
        it("should match when spy a called after spy b", function() {
          this.spyA();
          this.spyB();
          expect(this.spyB.calledAfter(this.spyA)).toBeTruthy();
          expect(this.spyB).toHaveBeenCalledAfter(this.spyA);
        });

        it("should not match when spy a called before spy b", function() {
          this.spyB();
          this.spyA();
          expect(this.spyB.calledAfter(this.spyA)).toBeFalsy();
          expect(this.spyB).not.toHaveBeenCalledAfter(this.spyA);
        });
      });
      
    });
    
    describe("calledOn/toHaveBeenCalledOn", function() {
      
      it("should match when spy called on expected object", function() {
        expect(this.spy.calledOn(this)).toBeFalsy();
        expect(this.spy).not.toHaveBeenCalledOn(this);
        this.spy.call(this);
        expect(this.spy.calledOn(this)).toBeTruthy();
        expect(this.spy).toHaveBeenCalledOn(this);
      });
      
    });
    
    describe("alwaysCalledOn/toHaveAlwaysBeenCalledOn/toHaveBeenAlwaysCalledOn", function() {
      
      it("should match when spy always called on expected object", function() {
        this.spy.call(this);
        this.spy.call(this);
        expect(this.spy.alwaysCalledOn(this)).toBeTruthy();
        expect(this.spy).toHaveBeenAlwaysCalledOn(this);
      });
      
      it("should not match when spy called with other object", function() {
        this.spy.call(this);
        this.spy.call({});
        expect(this.spy.alwaysCalledOn(this)).toBeFalsy();
        expect(this.spy).not.toHaveBeenAlwaysCalledOn(this);
      })
      
    });
    
    describe("calledWith/toHaveBeenCalledWith", function() {
      
      it("should match when spy called with argument", function() {
        this.spy('arg1');
        expect(this.spy.calledWith('arg1')).toBeTruthy();
        expect(this.spy).toHaveBeenCalledWith('arg1');
      });
      
      it("should not match when spy called with different arguments", function() {
        this.spy('arg1');
        expect(this.spy.calledWith('arg2')).toBeFalsy();
        expect(this.spy).not.toHaveBeenCalledWith('arg2');
      });
      
    });
    
    describe("alwaysCalledWith/toHaveBeenAlwaysCalledWith", function() {
      
      it("should match when spy always called with argument", function() {
        this.spy('arg1');
        this.spy('arg1', 'arg2');
        expect(this.spy.alwaysCalledWith('arg1')).toBeTruthy();
        expect(this.spy).toHaveBeenAlwaysCalledWith('arg1');
      });
      
      it("should not match when spy not always called with argument", function() {
        this.spy('arg1');
        this.spy('arg2');
        expect(this.spy.alwaysCalledWith('arg1')).toBeFalsy();
        expect(this.spy).not.toHaveBeenAlwaysCalledWith('arg');
      });
      
    });
    
    describe("calledWithExactly/toHaveBeenCalledWithExactly", function() {
      
      it("should match when spy called with exact argument set", function() {
        this.spy('arg1', 'arg2');
        expect(this.spy.calledWithExactly('arg1', 'arg2')).toBeTruthy();
        expect(this.spy).toHaveBeenCalledWithExactly('arg1', 'arg2');
      });
      
      it("should not match when spy called with different argument set", function() {
        this.spy('arg1', 'arg2', 'arg3');
        expect(this.spy.calledWithExactly('arg1', 'arg2')).toBeFalsy();
        expect(this.spy).not.toHaveBeenCalledWithExactly('arg1', 'arg2');
      });
      
    });
    
    describe("alwaysCalledWithExactly/toHaveBeenAlwaysCalledWithExactly", function() {
      
      it("should match when spy always called with exact argument set", function() {
        this.spy('arg1', 'arg2');
        this.spy('arg1', 'arg2');
        expect(this.spy.alwaysCalledWithExactly('arg1','arg2')).toBeTruthy();
        expect(this.spy).toHaveBeenAlwaysCalledWithExactly('arg1','arg2');
      });
      
      it("should not match when spy called with differing argument set", function() {
        this.spy('arg1', 'arg2');
        this.spy('arg1', 'arg2', 'arg3');
        expect(this.spy.alwaysCalledWithExactly('arg1','arg2')).toBeFalsy();
        expect(this.spy).not.toHaveBeenAlwaysCalledWithExactly('arg1','arg2');
      });
      
    });
    
    // TODO exception matchers
    
    describe("returned/toHaveReturned", function() {
      
      it("should match when spy returned value", function() {
        var spy = sinon.spy.create(function() {
          return 1;
        });
        spy();
        expect(spy.returned(1)).toBeTruthy();
        expect(spy).toHaveReturned(1);
      });
      
      it("should match when spy returned value amongst others", function() {
        var values = [1,2,3];
        var spy = sinon.spy.create(function() {
          return values[spy.callCount];
        });
        spy();
        spy();
        expect(spy.returned(3)).toBeTruthy();
        expect(spy).toHaveReturned(3);
      });
      
      it("should not match when spy did not return value", function() {
        var spy = sinon.spy();
        spy();
        expect(spy.returned(1)).toBeFalsy();
        expect(spy).not.toHaveReturned(1);
      });
      
    });
    
    describe("alwaysReturned/toHaveAlwaysReturned", function() {
      
      it("should match when spy always return value", function() {
        var spy = sinon.spy.create(function() {
          return 1;
        });
        spy();
        spy();
        expect(spy.alwaysReturned(1)).toBeTruthy();
        expect(spy).toHaveAlwaysReturned(1);
      });
      
      it("should not match when spy did not always return value", function() {
        var values = [1,2,3];
        var spy = sinon.spy.create(function() {
          return values[spy.callCount];
        });
        spy();
        spy();
        expect(spy.alwaysReturned(3)).toBeFalsy();
        expect(spy).not.toHaveAlwaysReturned(3);
      });
      
      it("should not match when spy did not return value", function() {
        var spy = sinon.spy();
        spy();
        expect(spy.alwaysReturned(1)).toBeFalsy();
        expect(spy).not.toHaveAlwaysReturned(1);
      });
      
    });

    
  });
  
  describe("existing method spy matchers", function() {
    
    beforeEach(function() {
      this.methodVal = "no";
      this.api = {
        myMethod: function(val) {
          this.methodVal = val;
        }
      }
      this.spy = sinon.spy(this.api, "myMethod");
    });
    
    describe("boolean matcher example", function() {
      it("should retain spy's original functionality", function() {
        expect(this.methodVal).toEqual("no");
        expect(this.spy).not.toHaveBeenCalled();
        this.api.myMethod.call(this, "yes");
        expect(this.methodVal).toEqual("yes");
        expect(this.spy).toHaveBeenCalled();
      });
    });
    
    describe("method matcher example", function() {
      it("should retain spy's original functionality", function() {
        expect(this.methodVal).toEqual("no");
        expect(this.spy).not.toHaveBeenCalledOn(this);
        this.api.myMethod.call(this, "yes");
        expect(this.methodVal).toEqual("yes");
        expect(this.spy).toHaveBeenCalledOn(this);
      });
    });
        
  });
  
  describe("individual spy calls", function() {

    beforeEach(function() {
      this.spy = sinon.spy();
    });

    describe("calledOn/toHaveBeenCalledOn", function() {

      it("should return true if obj was scope for call", function() {
        this.spy.call(this);
        var spyCall = this.spy.getCall(0);
        expect(spyCall.calledOn(this)).toBeTruthy();
        expect(spyCall).toHaveBeenCalledOn(this);
      });

      it("should not return true if scope was something else", function() {
        this.spy.call('foo');
        var spyCall = this.spy.getCall(0);
        expect(spyCall.calledOn(this)).toBeFalsy();
        expect(spyCall).not.toHaveBeenCalledOn(this);
      });

    });

    describe("calledWith/toHaveBeenCalledWith", function() {

      it("should return true if call received arguments", function() {
        this.spy('foo', 'bar');
        var spyCall = this.spy.getCall(0);
        expect(spyCall.calledWith('foo', 'bar')).toBeTruthy();
        expect(spyCall).toHaveBeenCalledWith('foo', 'bar');
      });

      it("should not return true if call did not receive arguments", function() {
        this.spy('fooble', 'barble');
        var spyCall = this.spy.getCall(0);
        expect(spyCall.calledWith('foo','bar')).toBeFalsy();
        expect(spyCall).not.toHaveBeenCalledWith('foo','bar');
      });

    });
    
    describe("calledWithExactly/toHaveBeenCalledWithExactly", function() {
      
      it("should return true if received provided arguments and no others", function() {
        this.spy('foo','bar');
        var spyCall = this.spy.getCall(0);
        expect(spyCall.calledWithExactly('foo','bar')).toBeTruthy();
        expect(spyCall).toHaveBeenCalledWithExactly('foo','bar');
      });
      
    });
    
    // TODO individual spy call exception matchers

  });
  
  describe("test stubs", function() {
    
    beforeEach(function() {
      this.anonStub = sinon.stub();
      this.api = {
        foo: function() {
          return 'bar';
        }
      }
      this.methodStub = sinon.stub(this.api,'foo');
    });
    
    describe("inherit spy matchers", function() {
      
      describe("boolean matcher examples", function() {

        it("should return true when anonymous stub was called", function() {
          this.anonStub();
          expect(this.anonStub.called).toBeTruthy();
          expect(this.anonStub).toHaveBeenCalled();
        });
        
        it("should return true when method stub was called", function() {
          this.api.foo();
          expect(this.methodStub.called).toBeTruthy();
          expect(this.methodStub).toHaveBeenCalled();
        });

        it("should return false when stubs were not called", function() {
          expect(this.anonStub.called).toBeFalsy();
          expect(this.anonStub).not.toHaveBeenCalled();
          expect(this.methodStub.called).toBeFalsy();
          expect(this.methodStub).not.toHaveBeenCalled();
        });
        
      });
      
      describe("method matcher examples", function() {
        
        it("should return true when anonymous stub called with scope", function() {
          this.anonStub.call(this);
          expect(this.anonStub.calledOn(this)).toBeTruthy();
          expect(this.anonStub).toHaveBeenCalledOn(this);
        });
        
        it("should return true when method stub was called with scope", function() {
          this.api.foo.call(this);
          expect(this.methodStub.calledOn(this)).toBeTruthy();
          expect(this.methodStub).toHaveBeenCalledOn(this);
        });
        
      });
      
    });
    
  });
  
});