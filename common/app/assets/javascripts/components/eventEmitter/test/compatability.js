// This is a compatability test
// It compares my EventEmitter to nodes
// They should be identical

var emitters = [
		require('../src/EventEmitter').EventEmitter,
		require('events').EventEmitter
	],
	i = null,
	a = null,
	EventEmitter = null,
	ee = null;

for(i = 0; i < emitters.length; i += 1) {
	EventEmitter = emitters[i];
	ee = new EventEmitter();
	
	// So at this point EventEmitter will contain one of the two
	// We just go about our bussiness testing the emitter
	// Hopefully both should work exactly the same
	
	ee.on('speak', function(message, secondMessage) {
		console.log(message);
		console.log(secondMessage);
	});
	
	ee.emit('speak', 'Hello, World!', 'How have you been?');
	
	ee.setMaxListeners(5);
	
	// This is testing the listener limit
	for(a = 0; a < 15; a += 1) {
		ee.on('speak', function() {
			// Testing the limit
		});
	}
}