# API

Each of the methods listed in the API are accessed through an instance of EventEmitter. You can create an instance with `var ee = new EventEmitter();`. Then you can call API methods from `ee`, for example `ee.emitEvent('foo');`.

You may also be interested in [the guide](https://github.com/Wolfy87/EventEmitter/blob/master/docs/guide.md) which highlights some key features of EventEmitter and how to use them. It is a broad overview of the script whereas this is concise information about each method in the API.

## getListeners

<p>Returns the listener array for the specified event.<br />Will initialise the event object and listener arrays if required.</p>

 * **param** (String) _evt_ - Name of the event to return the listeners from.
 * **return** (Function[]) - All listener functions for the event.

## addListener

<p>Adds a listener function to the specified event.<br />The listener will not be added if it is a duplicate.<br />If the listener returns true then it will be removed after it is called.</p>

 * **param** (String) _evt_ - Name of the event to attach the listener to.
 * **param** (Function) _listener_ - Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
 * **return** (Object) - Current instance of EventEmitter for chaining.

## on

<p>Alias of addListener</p>


## removeListener

<p>Removes a listener function from the specified event.</p>

 * **param** (String) _evt_ - Name of the event to remove the listener from.
 * **param** (Function) _listener_ - Method to remove from the event.
 * **return** (Object) - Current instance of EventEmitter for chaining.

## off

<p>Alias of removeListener</p>


## addListeners

<p>Adds listeners in bulk using the manipulateListeners method.<br />If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.<br />You can also pass it an event name and an array of listeners to be added.</p>

 * **param** (String | Object) _evt_ - An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
 * **param** (Function[]) _[listeners]_ - An optional array of listener functions to add.
 * **return** (Object) - Current instance of EventEmitter for chaining.

## removeListeners

<p>Removes listeners in bulk using the manipulateListeners method.<br />If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.<br />You can also pass it an event name and an array of listeners to be removed.</p>

 * **param** (String | Object) _evt_ - An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
 * **param** (Function[]) _[listeners]_ - An optional array of listener functions to remove.
 * **return** (Object) - Current instance of EventEmitter for chaining.

## manipulateListeners

<p>Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.<br />The first argument will determine if the listeners are removed (true) or added (false).<br />If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.<br />You can also pass it an event name and an array of listeners to be added/removed.</p>

 * **param** (Boolean) _remove_ - True if you want to remove listeners, false if you want to add.
 * **param** (String | Object) _evt_ - An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
 * **param** (Function[]) _[listeners]_ - An optional array of listener functions to add/remove.
 * **return** (Object) - Current instance of EventEmitter for chaining.

## removeEvent

<p>Removes all listeners from a specified event.<br />If you do not specify an event then all listeners will be removed.<br />That means every event will be emptied.</p>

 * **param** (String) _[evt]_ - Optional name of the event to remove all listeners for. Will remove from every event if not passed.
 * **return** (Object) - Current instance of EventEmitter for chaining.

## emitEvent

<p>Emits an event of your choice.<br />When emitted, every listener attached to that event will be executed.<br />If you pass the optional argument array then those arguments will be passed to every listener upon execution.<br />Because it uses <code>apply</code>, your array of arguments will be passed as if you wrote them out separately.<br />So they will not arrive within the array on the other side, they will be separate.</p>

 * **param** (String) _evt_ - Name of the event to emit and execute listeners for.
 * **param** (Array) _[args]_ - Optional array of arguments to be passed to each listener.
 * **return** (Object) - Current instance of EventEmitter for chaining.

## trigger

<p>Alias of emitEvent</p>


## emit

<p>Subtly different from emitEvent in that it will pass its arguments on to the listeners, as<br />opposed to taking a single array of arguments to pass on.</p>

 * **param** (String) _evt_ - Name of the event to emit and execute listeners for.
 * **param** (...*) _Optional_ - additional arguments to be passed to each listener.
 * **return** (Object) - Current instance of EventEmitter for chaining.
