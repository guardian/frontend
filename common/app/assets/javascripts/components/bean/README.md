# Bean
Bean is a small, fast, cross-platform, framework-agnostic event manager designed for desktop, mobile, and touch-based browsers. In its simplest form - it works like this:

```js
bean.on(element, 'click', function (e) {
  console.log('hello');
});
```

Bean is included in [Ender](http://ender.no.de)'s *starter pack*, "The Jeesh". More details on the Ender interface [below](#ender).

## API

Bean has five main methods, each packing quite a punch.

  * <a href="#on">bean.<code>on()</code></a>
  * <a href="#one">bean.<code>one()</code></a>
  * <a href="#off">bean.<code>off()</code></a>
  * <a href="#clone">bean.<code>clone()</code></a>
  * <a href="#fire">bean.<code>fire()</code></a>

--------------------------------------------------------
<a name="on"></a>
### on(element, eventType[, selector], handler[, args ])
<code>bean.on()</code> lets you attach event listeners to both elements and objects.

**Arguments**

  * **element / object** (DOM Element or Object) - an HTML DOM element or any JavaScript Object
  * **event type(s)** (String) - an event (or multiple events, space separated) to listen to
  * **selector** (optional String) - a CSS DOM Element selector string to bind the listener to child elements matching the selector
  * **handler** (Function) - the callback function
  * **args** (optional) - additional arguments to pas to the callback function when triggered

Optionally, event types and handlers can be passed in an object of the form `{ 'eventType': handler }` as the second argument.

**Examples**

```js
// simple
bean.on(element, 'click', handler);

// optional arguments passed to handler
bean.on(element, 'click', function(e, o1, o2) {
  console.log(o1, o2);
}, 'fat', 'ded');

// multiple events
bean.on(element, 'keydown keyup', handler);

// multiple handlers
bean.on(element, {
  click: function (e) {},
  mouseover: function (e) {},
  'focus blur': function (e) {}
});
```

**Delegation**

A String as the 3rd argument to `on()` will be interpreted as a selector for event delegation. Events for child elements will cause the element to be checked against the selector and the event to be fired if a match is found. The event behaves the same way as if you listened directly to the element it was fired on.

```js
// event delegated events
bean.on(element, 'click', '.content p', handler);

// Alternatively, you can pass an array of elements.
// This cuts down on selector engine work, and is a more performant means of
// delegation if you know your DOM won't be changing:
bean.on(element, [el, el2, el3], 'click', handler);
bean.on(element, $('.myClass'), 'click', handler);
```

**Notes**

 * Prior to v1, Bean used `add()` as its primary handler-adding interface, it still exists but uses the original argument order for delegated events: `add(element[, selector], eventType, handler[, args ])`. This may be removed in future versions of Bean.

 * The focus, blur, and submit events will not delegate due to [vagaries](http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html) of the DOM model. This *may* be addressed in a future version of Bean.

**Namespacing**

Bean supports namespacing your events. This makes it much easier to target the handlers later when using `off()` or `fire()`, both of these methods match namespaced handlers in the same way.

To namespace an event just add a dot followed by your unique name identifier:

```js
bean.on(element, 'click.fat.foo', fn);  // 1
bean.on(element, 'click.ded', fn);      // 2
bean.on(element, 'click', fn);          // 3

// later:
bean.fire(element, 'click.ded');        // trigger 2
bean.fire(element, 'click.fat');        // trigger 1
bean.off(element, 'click');             // remove 1, 2 & 3

// fire() & off() match multiple namespaces with AND, not OR:
bean.fire(element, 'click.fat.foo');    // trigger 1
bean.off(element, 'click.fat.ded');     // remove nothing
```

**Notes**

 * Prior to v1, Bean matched multiple namespaces in `fire()` and `remove()` calls using OR rather than AND.

--------------------------------------------------------
<a name="one"></a>
### one(element, eventType[, selector], handler[, args ])
<code>bean.one()</code> is an alias for <code>bean.on()</code> except that the handler will only be executed once and then removed for the event type(s).

**Notes**

 * Prior to v1, `one()` used the same argument ordering as `add()` (see note above), it now uses the new `on()` ordering.

--------------------------------------------------------
<a name="off"></a>
### off(element[, eventType[, handler ]])
<code>bean.off()</code> is how you get rid of handlers once you no longer want them active. It's also a good idea to call *off* on elements before you remove them from your DOM; this gives Bean a chance to clean up some things and prevents memory leaks.

**Arguments**

  * **element / object** (DOM Element or Object) - an HTML DOM element or any JavaScript Object
  * **event type(s)** (optional String) - an event (or multiple events, space separated) to remove
  * **handler** (optional Function) - the specific callback function to remove

Optionally, event types and handlers can be passed in an object of the form `{ 'eventType': handler }` as the second argument, just like `on()`.

**Examples**

```js
// remove a single event handlers
bean.off(element, 'click', handler);

// remove all click handlers
bean.off(element, 'click');

// remove handler for all events
bean.off(element, handler);

// remove multiple events
bean.off(element, 'mousedown mouseup');

// remove all events
bean.off(element);

// remove handlers for events using object literal
bean.off(element, { click: clickHandler, keyup: keyupHandler })
```

**Notes**

 * Prior to Bean v1, `remove()` was the primary removal interface. This is retained as an alias for backward compatibility but may eventually be removed.

--------------------------------------------------------
<a name="clone"></a>
### clone(destElement, srcElement[, eventType ])
<code>bean.clone()</code> is a method for cloning events from one DOM element or object to another.

**Examples**

```js
// clone all events at once by doing this:
bean.clone(toElement, fromElement);

// clone events of a specific type
bean.clone(toElement, fromElement, 'click');
```

--------------------------------------------------------
<a name="fire"></a>
### fire(element, eventType[, args ])
<code>bean.fire()</code> gives you the ability to trigger events.

**Examples**

```js
// fire a single event on an element
bean.fire(element, 'click');

// fire multiple types
bean.fire(element, 'mousedown mouseup');
```

**Notes**

 * An optional args array may be passed to `fire()` which will in turn be passed to the event handlers. Handlers will be triggered manually, outside of the DOM, even if you're trying to fire standard DOM events.


--------------------------------------------------------
<a name="setSelectorEngine"></a>
### setSelectorEngine(selectorEngine)
<code>bean.setSelectorEngine()</code> allows you to set a default selector engine for all your delegation needs.

The selector engine simply needs to be a function that takes two arguments: a selector string and a root element, it should return an array of matched DOM elements. [Qwery](https://github.com/ded/qwery), [Sel](https://github.com/amccollum/sel), [Sizzle](https://github.com/jquery/sizzle), [NWMatcher](https://github.com/dperini/nwmatcher) and other selector engines should all be compatible with Bean.

**Examples**

```js
bean.setSelectorEngine(qwery);
```

**Notes**

 * `querySelectorAll()` is used as the default selector engine, this is available on most modern platforms such as mobile WebKit. To support event delegation on older browsers you will need to install a selector engine.

## The `Event` object

Bean implements a variant of the standard DOM `Event` object, supplied as the argument to your DOM event handler functions. Bean wraps and *fixes* the native `Event` object where required, providing a consistent interface across browsers.

```js
// prevent default behavior and propagation (even works on old IE)
bean.on(el, 'click', function (event) {
  event.preventDefault();
  event.stopPropagation();
});

// a simple shortcut version of the above code
bean.on(el, 'click', function (event) {
  event.stop();
});

// prevent all subsequent handlers from being triggered for this particular event
bean.on(el, 'click', function (event) {
  event.stopImmediatePropagation();
});
```

**Notes**

 * Your mileage with the `Event` methods (`preventDefault` etc.) may vary with delegated events as the events are not intercepted at the element in question.

## Custom events

Bean uses methods similar to [Dean Edwards' event model](http://dean.edwards.name/weblog/2009/03/callbacks-vs-events/) to ensure custom events behave like real events, rather than just callbacks.

For all intents and purposes, you can just think of them as native DOM events, which will bubble up and behave you would expect.

**Examples**

```js
bean.on(element, 'partytime', handler);
bean.fire(element, 'partytime');
```

## mouseenter, mouseleave

Bean provides you with two custom DOM events, *'mouseenter'* and *'mouseleave'*. They are essentially just helpers for making your mouseover / mouseout lives a bit easier.

**Examples**

```js
bean.on(element, 'mouseenter', enterHandler);
bean.on(element, 'mouseleave', leaveHandler);
```

## Object support

Everything you can do in Bean with an element, you can also do with an object. This is particularly useful for working with classes or plugins.

```js
var inst = new Klass();
bean.on(inst, 'complete', handler);

//later on...
bean.fire(inst, 'complete');
```

<a name="ender"></a>
## Ender Integration API

If you use Bean with Ender its API is greatly extended through its bridge file. This extension aims to give Bean the look and feel of jQuery.

**Add events**

 + on - <code>$(element).on('click', fn);</code>
 + addListener - <code>$(element).addListener('click', fn);</code>
 + bind - <code>$(element).bind('click', fn);</code>
 + listen - <code>$(element).listen('click', fn);</code>

**Remove events**

 + off - <code>$(element).off('click');</code>
 + unbind - <code>$(element).unbind('click');</code>
 + unlisten - <code>$(element).unlisten('click');</code>
 + removeListener - <code>$(element).removeListener('click');</code>

**Delegate events**

 + on - <code>$(element).on('click', '.foo', fn);</code>
 + delegate - <code>$(element).delegate('.foo', 'click', fn);</code>
 + undelegate - <code>$(element).undelegate('.foo', 'click');</code>

**Clone events**

 + cloneEvents - <code>$(element).cloneEvents('.foo', fn);</code>

**Custom events**

 + fire / emit / trigger - <code>$(element).trigger('click')</code>

**Special events**

 + hover - <code>$(element).hover(enterfn, leavefn);</code>
 + blur - <code>$(element).blur(fn);</code>
 + change - <code>$(element).change(fn);</code>
 + click - <code>$(element).click(fn);</code>
 + dblclick - <code>$(element).dblclick(fn);</code>
 + focusin - <code>$(element).focusin(fn);</code>
 + focusout - <code>$(element).focusout(fn);</code>
 + keydown - <code>$(element).keydown(fn);</code>
 + keypress - <code>$(element).keypress(fn);</code>
 + keyup - <code>$(element).keyup(fn);</code>
 + mousedown - <code>$(element).mousedown(fn);</code>
 + mouseenter - <code>$(element).mouseenter(fn);</code>
 + mouseleave - <code>$(element).mouseleave(fn);</code>
 + mouseout - <code>$(element).mouseout(fn);</code>
 + mouseover - <code>$(element).mouseover(fn);</code>
 + mouseup - <code>$(element).mouseup(fn);</code>
 + mousemove - <code>$(element).mousemove(fn);</code>
 + resize - <code>$(element).resize(fn);</code>
 + scroll - <code>$(element).scroll(fn);</code>
 + select - <code>$(element).select(fn);</code>
 + submit - <code>$(element).submit(fn);</code>
 + unload - <code>$(element).unload(fn);</code>

## Browser support

Bean passes our tests in all the following browsers. If you've found bugs in these browsers or others please let us know by submitting an issue on GitHub!

  - IE6+
  - Chrome 1+
  - Safari 4+
  - Firefox 3.5+
  - Opera 10+

## Contributing

Bean uses [BusterJS](http://busterjs.org/) for its unit tests. `npm install` will install Buster and other required development dependencies for you and then you can simply point your browser at *bean/tests/tests.html*.

A Buster configuration file also exists so you can use `buster-server` to run a capture server to attach multiple browsers to and then `buster-test` to run the tests (if you don't have Buster installed globally, you can find the executables in *node_modules/.bin/*).

We're more than happy to consider pull requests, however major features that have not been previously discussed may risk being rejected. Feel free to open an issue on GitHub for discussion or questions.

Contributions should stick with Bean's coding style: comma-first, semicolon-free and two-space indenting. Non-trivial contributions should come with unit tests also, feel free to ask questions if you have trouble.

Running `make` will assemble the *bean.js* file in the root of the repository. Please be aware that any contributions to bean should be in *src/bean.js* or they will be lost!

## Contributors

  * [Jacob Thornton](https://github.com/fat/bean/commits/master?author=fat) ([GitHub](https://github.com/fat) - [Twitter](https://twitter.com/fat))
  * [Rod Vagg](https://github.com/fat/bean/commits/master?author=rvagg) ([GitHub](https://github.com/rvagg) - [Twitter](https://twitter.com/rvagg))
  * [Dustin Diaz](https://github.com/fat/bean/commits/master?author=ded) ([GitHub](https://github.com/ded) - [Twitter](https://twitter.com/ded))

Special thanks to:

 * [Dean Edwards](http://dean.edwards.name/)
 * [Diego Perini](https://github.com/dperini/nwevents)
 * [The entire MooTools team](https://github.com/mootools/mootools-core)

## Licence & copyright

Bean is copyright &copy; 2011-2012 Jacob Thornton and licenced under the MIT licence. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE file for more details.
