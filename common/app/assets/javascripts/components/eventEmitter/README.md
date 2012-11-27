# EventEmitter

**Evented JavaScript for the browser**

This script adds the EventEmitter class to your browser or any other environment such as [node.js](http://nodejs.org/).

So you can listen for and emit events from what ever objects you choose.

For more information such as documentation and examples you can either skim over the rest of this readme or [visit the wiki](https://github.com/Wolfy87/EventEmitter/wiki). Any contribution to the wiki are much appreciated.

## Example

	// Initialise the EventEmitter
	var ee = new EventEmitter();
	
	// Initialise the listener function
	function myListener() {
		console.log('The foo event was emitted.');
	}
	
	// Add the listener
	ee.addListener('foo', myListener);
	
	// Emit the foo event
	ee.emit('foo'); // The listener function is now called
	
	// Remove the listener
	ee.removeListener('foo', myListener);
	
	// Log the array of listeners to show that it has been removed
	console.log(ee.listeners('foo'));

## Tests

EventEmitter is tested and working in the following browsers.

 * Chrome
 * Firefox
 * Safari
 * Opera
 * IE 5+

If you test it in something a little more obscure, please let me know how it turned out.

To test, simply run `test.html` in the test folder.

## License

[![Creative Commons License](http://i.creativecommons.org/l/by/3.0/88x31.png)](http://creativecommons.org/licenses/by/3.0/)

EventEmitter by [Oliver Caldwell](http://oli.me.uk) is licensed under a [Creative Commons Attribution 3.0 Unported License](http://creativecommons.org/licenses/by/3.0/).