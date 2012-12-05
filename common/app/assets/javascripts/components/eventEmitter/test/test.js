/**
 * EventEmitter tests
 */

(function() {
	test('Adding and retrieving listeners', function() {
		var ee = new EventEmitter();
		
		equal(ee.listeners('testEvent').length, 0, 'Checking for any listeners');
		
		ee.addListener('testEvent', function() {
			// Listener
			return true;
		});
		equal(ee.listeners('testEvent')[0](), true, 'Retrieving the first listener');
		
		ee.addListener('testEvent', function() {
			// Another listener for the same event
			return true;
		});
		equal(ee.listeners('testEvent')[1](), true, 'Retrieving the second listener');
		
		ee.addListener('anotherTestEvent', function() {
			// Listener for new event
			return true;
		});
		equal(ee.listeners('anotherTestEvent')[0](), true, 'Retrieving the first listener for a different event');
		
		ee.addListener('anotherTestEvent', function() {
			// Another listener for new event
			return true;
		});
		equal(ee.listeners('anotherTestEvent')[1](), true, 'Retrieving the second listener for a different event');
		
		ee.on('onTest', function() {
			// Listener via the alias
			return true;
		});
		equal(ee.listeners('onTest')[0](), true, 'Retrieving the first listener for a different event added via the on alias');
		
		var scopeTarget = {
			foo: false
		};
		ee.addListener('scopeTest', function() {
			// Scope test
			this.foo = true;
		}, scopeTarget);
		equal(scopeTarget.foo, false, 'Check that the scope target is currently false');
		ee.emit('scopeTest');
		equal(scopeTarget.foo, true, 'Check that the scope target has been changed to true');
	});
	
	test('Removing listeners', function() {
		var ee = new EventEmitter();
		
		function testListener() {
			// Listener
			return true;
		}
		
		function testListener2() {
			// Listener 2
			return true;
		}
		
		ee.addListener('testEvent', testListener);
		equal(ee.listeners('testEvent')[0](), true, 'Retrieving the first listener');
		
		ee.addListener('testEvent', testListener2);
		equal(ee.listeners('testEvent')[1](), true, 'Retrieving the second listener');
		
		ee.removeListener('testEvent', testListener);
		equal(ee.listeners('testEvent')[1], undefined, 'Retrieving the second listener (should be gone)');
		equal(ee.listeners('testEvent')[0], testListener2, 'First should now be the second');
		
		ee.removeListener('testEvent', testListener2);
		ok(ee.listeners('testEvent'), 'Retrieving any listeners (should be gone)');
		
		ee.addListener('removeAllTest', function() {
			// Listener
			return true;
		});
		ee.addListener('removeAllTest', function() {
			// Another listener for the same event
			return true;
		});
		equal(ee.listeners('removeAllTest')[1](), true, 'Check for a second removeAllTest listener');
		ee.removeAllListeners('removeAllTest');
		equal(ee.listeners('removeAllTest').length, 0, 'Retrieving any listeners from removeAllTest (should be gone)');
		
		var scopeTarget = {
			foo: false
		};
		ee.addListener('scopeTest', testListener);
		ee.addListener('scopeTest', testListener);
		ee.addListener('scopeTest', testListener, scopeTarget);
		ee.addListener('scopeTest', testListener);
		equal(ee._events['scopeTest'][2].scope, scopeTarget, 'Check that the one with the scope exists.');
		equal(ee.listeners('scopeTest')[2](), true, 'Make sure we can execute the scoped listener.')
		ee.removeListener('scopeTest', testListener, scopeTarget);
		equal(ee._events['scopeTest'][0].scope, undefined, 'The last three should have no scope. (1)');
		equal(ee._events['scopeTest'][1].scope, undefined, 'The last three should have no scope. (2)');
		equal(ee._events['scopeTest'][2].scope, undefined, 'The last three should have no scope. (3)');
	});
	
	test('Removing all listeners', function() {
		var ee = new EventEmitter();
		
		ee.on('foo', function() {
			console.log('bar');
		});
		
		equal(ee.listeners('foo').length, 1, 'Check that it was added');
		
		ee.removeAllListeners();
		
		equal(ee.listeners('foo'), false, 'Check that it was removed');
	});
	
	test('Emitting events', function() {
		var ee = new EventEmitter();
		
		ee.addListener('emittingTest', function() {
			// Listener
			ok(true, 'First called');
		});
		ee.addListener('emittingTest', function() {
			// Another listener for the same event
			ok(true, 'Second called');
		});
		ee.addListener('differentEvent', function() {
			// Another listener for the same event
			ok(false, 'Wrong event called');
		});
		ee.emit('emittingTest');
	});
	
	test('Adding and calling a once event', function() {
		var ee = new EventEmitter();
		
		function normalFunction() {
			// Another listener for the same event but not a once event
			return true;
		}
		
		ee.once('onceTest', function() {
			// Listener
			return true;
		});
		ee.once('onceTest', function() {
			// Another listener for the same event
			return true;
		});
		ee.addListener('onceTest', normalFunction);
		equal(ee.listeners('onceTest')[2](), true, 'Check for a third onceTest listener');
		
		// Emit the once test event
		ee.emit('onceTest');
		equal(ee.listeners('onceTest')[0], normalFunction, 'There should only be one survivor, the normalFunction one');
		equal(ee.listeners('onceTest')[2], undefined, 'And a second should be undefined');
	});
	
	test('Passing arguments to listeners', function() {
		var ee = new EventEmitter();
		
		ee.addListener('argTest', function(aBool) {
			equal(aBool, true, 'Passing of a boolean that equals true');
		});
		
		ee.addListener('argTest2', function(aString, aBool) {
			equal(aString, 'foo', 'Passing of a string');
			equal(aBool, true, 'Passing of a boolean that equals true as the second argument');
		});
		
		ee.emit('argTest', true);
		ee.emit('argTest2', 'foo', true);
	});
	
	test('Exceeding the max listener count', function() {
		var i = null;
		
		var ee = new EventEmitter();
		ee.setMaxListeners(3);
		
		for(i = 0; i < 4; i += 1) {
			ee.on('foo', function() {
				console.log('bar');
			});
		}
		
		equal(ee._events.foo.warned, true, 'Check if we have been warned');
	});
}());