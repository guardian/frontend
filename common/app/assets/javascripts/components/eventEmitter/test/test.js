/**
 * EventEmitter tests
 */

(function() {
	test('Adding and retrieving listeners', function() {
		var ee = new EventEmitter();
		
		equal(ee.listeners('testEvent'), false, 'Checking for any listeners');
		
		ee.addListener('testEvent', function() {
			// Listener
		});
		equal(ee.listeners('testEvent')[0].type, 'testEvent', 'Retrieving the first listener');
		
		ee.addListener('testEvent', function() {
			// Another listener for the same event
		});
		equal(ee.listeners('testEvent')[1].type, 'testEvent', 'Retrieving the second listener');
		
		ee.addListener('anotherTestEvent', function() {
			// Listener for new event
		});
		equal(ee.listeners('anotherTestEvent')[0].type, 'anotherTestEvent', 'Retrieving the first listener for a different event');
		
		ee.addListener('anotherTestEvent', function() {
			// Another listener for new event
		});
		equal(ee.listeners('anotherTestEvent')[1].type, 'anotherTestEvent', 'Retrieving the second listener for a different event');
		
		ee.addListener('onTest', function() {
			// Listener via the alias
		});
		equal(ee.listeners('onTest')[0].type, 'onTest', 'Retrieving the first listener for a different event added via the on alias');
	});
	
	test('Removing listeners', function() {
		var ee = new EventEmitter();
		
		function testListener() {
			// Listener
		}
		
		function testListener2() {
			// Listener 2
		}
		
		ee.addListener('testEvent', testListener);
		equal(ee.listeners('testEvent')[0].type, 'testEvent', 'Retrieving the first listener');
		
		ee.addListener('testEvent', testListener2);
		equal(ee.listeners('testEvent')[1].type, 'testEvent', 'Retrieving the second listener');
		
		ee.removeListener('testEvent', testListener);
		equal(ee.listeners('testEvent')[1], undefined, 'Retrieving the second listener (should be gone)');
		equal(ee.listeners('testEvent')[0].listener, testListener2, 'First should now be the second');
		
		ee.removeListener('testEvent', testListener2);
		equal(ee.listeners('testEvent'), false, 'Retrieving any listeners (should be gone)');
		
		ee.addListener('removeAllTest', function() {
			// Listener
		});
		ee.addListener('removeAllTest', function() {
			// Another listener for the same event
		});
		equal(ee.listeners('removeAllTest')[1].type, 'removeAllTest', 'Check for a second removeAllTest listener');
		ee.removeAllListeners('removeAllTest');
		equal(ee.listeners('removeAllTest'), false, 'Retrieving any listeners from removeAllTest (should be gone)');
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
		}
		
		ee.once('onceTest', function() {
			// Listener
		});
		ee.once('onceTest', function() {
			// Another listener for the same event
		});
		ee.addListener('onceTest', normalFunction);
		equal(ee.listeners('onceTest')[2].type, 'onceTest', 'Check for a third onceTest listener');
		
		// Emit the once test event
		ee.emit('onceTest');
		equal(ee.listeners('onceTest')[0].listener, normalFunction, 'There should only be one survivor, the normalFunction one');
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
		
		ee.emit('argTest', [true]);
		ee.emit('argTest2', ['foo', true]);
	});
}());