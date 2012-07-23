/**
 * EventEmitter v3.1.5
 * https://github.com/Wolfy87/EventEmitter
 *
 * Oliver Caldwell (http://oli.me.uk)
 * Creative Commons Attribution 3.0 Unported License (http://creativecommons.org/licenses/by/3.0/)
 */

;(function(exports) {
	// JSHint config
	/*jshint smarttabs:true,devel:true*/
	/*global define:true*/
	
	// Place the script into strict mode
	'use strict';
	
	/**
	 * EventEmitter class
	 * Creates an object with event registering and firing methods
	 */
	function EventEmitter() {
		// Initialise required storage variables
		this._events = {};
		this._maxListeners = 10;
	}
	
	/**
	 * Event class
	 * Contains Event methods and property storage
	 *
	 * @param {String} type Event type name
	 * @param {Function} listener Function to be called when the event is fired
	 * @param {Object} scope Object that this should be set to when the listener is called
	 * @param {Boolean} once If true then the listener will be removed after the first call
	 * @param {Object} instance The parent EventEmitter instance
	 */
	function Event(type, listener, scope, once, instance) {
		// Store arguments
		this.type = type;
		this.listener = listener;
		this.scope = scope;
		this.once = once;
		this.instance = instance;
	}
	
	/**
	 * Executes the listener
	 *
	 * @param {Array} args List of arguments to pass to the listener
	 * @return {Boolean} If false then it was a once event
	 */
	Event.prototype.fire = function(args) {
		this.listener.apply(this.scope || this.instance, args);
		
		// Remove the listener if this is a once only listener
		if(this.once) {
			this.instance.removeListener(this.type, this.listener, this.scope);
			return false;
		}
	};
	
	/**
	 * Passes every listener for a specified event to a function one at a time
	 *
	 * @param {String} type Event type name
	 * @param {Function} callback Function to pass each listener to
	 * @return {Object} The current EventEmitter instance to allow chaining
	 */
	EventEmitter.prototype.eachListener = function(type, callback) {
		// Initialise variables
		var i = null,
			possibleListeners = null,
			result = null;
		
		// Only loop if the type exists
		if(this._events.hasOwnProperty(type)) {
			possibleListeners = this._events[type];
			
			for(i = 0; i < possibleListeners.length; i += 1) {
				result = callback.call(this, possibleListeners[i], i);
				
				if(result === false) {
					i -= 1;
				}
				else if(result === true) {
					break;
				}
			}
		}
		
		// Return the instance to allow chaining
		return this;
	};
	
	/**
	 * Adds an event listener for the specified event
	 *
	 * @param {String} type Event type name
	 * @param {Function} listener Function to be called when the event is fired
	 * @param {Object} scope Object that this should be set to when the listener is called
	 * @param {Boolean} once If true then the listener will be removed after the first call
	 * @return {Object} The current EventEmitter instance to allow chaining
	 */
	EventEmitter.prototype.addListener = function(type, listener, scope, once) {
		// Create the listener array if it does not exist yet
		if(!this._events.hasOwnProperty(type)) {
			this._events[type] = [];
		}
		
		// Push the new event to the array
		this._events[type].push(new Event(type, listener, scope, once, this));
		
		// Emit the new listener event
		this.emit('newListener', type, listener, scope, once);
		
		// Check if we have exceeded the maxListener count
		// Ignore this check if the count is 0
		// Also don't check if we have already fired a warning
		if(this._maxListeners && !this._events[type].warned && this._events[type].length > this._maxListeners) {
			// The max listener count has been exceeded!
			// Warn via the console if it exists
			if(typeof console !== 'undefined') {
				console.warn('Possible EventEmitter memory leak detected. ' + this._events[type].length + ' listeners added. Use emitter.setMaxListeners() to increase limit.');
			}
			
			// Set the flag so it doesn't fire again
			this._events[type].warned = true;
		}
		
		// Return the instance to allow chaining
		return this;
	};
	
	/**
	 * Alias of the addListener method
	 *
	 * @param {String} type Event type name
	 * @param {Function} listener Function to be called when the event is fired
	 * @param {Object} scope Object that this should be set to when the listener is called
	 * @param {Boolean} once If true then the listener will be removed after the first call
	 */
	EventEmitter.prototype.on = EventEmitter.prototype.addListener;
	
	/**
	 * Alias of the addListener method but will remove the event after the first use
	 *
	 * @param {String} type Event type name
	 * @param {Function} listener Function to be called when the event is fired
	 * @param {Object} scope Object that this should be set to when the listener is called
	 * @return {Object} The current EventEmitter instance to allow chaining
	 */
	EventEmitter.prototype.once = function(type, listener, scope) {
		return this.addListener(type, listener, scope, true);
	};
	
	/**
	 * Removes the a listener for the specified event
	 *
	 * @param {String} type Event type name the listener must have for the event to be removed
	 * @param {Function} listener Listener the event must have to be removed
	 * @param {Object} scope The scope the event must have to be removed
	 * @return {Object} The current EventEmitter instance to allow chaining
	 */
	EventEmitter.prototype.removeListener = function(type, listener, scope) {
		this.eachListener(type, function(currentListener, index) {
			// If this is the listener remove it from the array
			// We also compare the scope if it was passed
			if(currentListener.listener === listener && (!scope || currentListener.scope === scope)) {
				this._events[type].splice(index, 1);
			}
		});
		
		// Remove the property if there are no more listeners
		if(this._events[type] && this._events[type].length === 0) {
			delete this._events[type];
		}
		
		// Return the instance to allow chaining
		return this;
	};
	
	/**
	 * Alias of the removeListener method
	 *
	 * @param {String} type Event type name the listener must have for the event to be removed
	 * @param {Function} listener Listener the event must have to be removed
	 * @param {Object} scope The scope the event must have to be removed
	 * @return {Object} The current EventEmitter instance to allow chaining
	 */
	EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
	
	/**
	 * Removes all listeners for a specified event
	 * If no event type is passed it will remove every listener
	 *
	 * @param {String} type Event type name to remove all listeners from
	 * @return {Object} The current EventEmitter instance to allow chaining
	 */
	EventEmitter.prototype.removeAllListeners = function(type) {
		// Check for a type, if there is none remove all listeners
		// If there is a type however, just remove the listeners for that type
		if(type && this._events.hasOwnProperty(type)) {
			delete this._events[type];
		}
		else if(!type) {
			this._events = {};
		}
		
		// Return the instance to allow chaining
		return this;
	};
	
	/**
	 * Retrieves the array of listeners for a specified event
	 *
	 * @param {String} type Event type name to return all listeners from
	 * @return {Array} Will return either an array of listeners or an empty array if there are none
	 */
	EventEmitter.prototype.listeners = function(type) {
		// Return the array of listeners or an empty array if it does not exist
		if(this._events.hasOwnProperty(type)) {
			// It does exist, loop over building the array
			var listeners = [];
			
			this.eachListener(type, function(evt) {
				listeners.push(evt.listener);
			});
			
			return listeners;
		}
		
		return [];
	};
	
	/**
	 * Emits an event executing all appropriate listeners
	 * All values passed after the type will be passed as arguments to the listeners
	 *
	 * @param {String} type Event type name to run all listeners from
	 * @return {Object} The current EventEmitter instance to allow chaining
	 */
	EventEmitter.prototype.emit = function(type) {
		// Calculate the arguments
		var args = [],
			i = null;
		
		for(i = 1; i < arguments.length; i += 1) {
			args.push(arguments[i]);
		}
		
		this.eachListener(type, function(currentListener) {
			return currentListener.fire(args);
		});
		
		// Return the instance to allow chaining
		return this;
	};
	
	/**
	 * Sets the max listener count for the EventEmitter
	 * When the count of listeners for an event exceeds this limit a warning will be printed
	 * Set to 0 for no limit
	 *
	 * @param {Number} maxListeners The new max listener limit
	 * @return {Object} The current EventEmitter instance to allow chaining
	 */
	EventEmitter.prototype.setMaxListeners = function(maxListeners) {
		this._maxListeners = maxListeners;
		
		// Return the instance to allow chaining
		return this;
	};
	
	/**
	 * Builds a clone of the prototype object for you to extend with
	 *
	 * @return {Object} A clone of the EventEmitter prototype object
	 */
	EventEmitter.extend = function() {
		// First thing we need to do is create our new prototype
		// Then we loop over the current one copying each method out
		// When done, simply return the clone
		var clone = {},
			current = this.prototype,
			key = null;
		
		for(key in current) {
			// Make sure this is actually a property of the object before copying it
			// We don't want any default object methods leaking though
			if(current.hasOwnProperty(key)) {
				clone[key] = current[key];
			}
		}
		
		// All done, return the clone
		return clone;
	};
	
	// Export the class
	// If AMD is available then use it
	if(typeof define === 'function' && define.amd) {
		define(function() {
			return EventEmitter;
		});
	}
	
	// No matter what it will be added to the global object
	exports.EventEmitter = EventEmitter;
}(this));
