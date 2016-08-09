We have a couple of JS-specific guides: a general, global style guide, and then a project-specific one.

## General JavaScript style guide

This can be found [as part of Pasteup's JavaScript conventions](https://github.com/guardian/pasteup/blob/master/js/README.md).

Generally, follow [Crockford's style guide](http://javascript.crockford.com/code.html)

## Project specific JavaScript guidelines
(To be used within the Frontend project, and anywhere else with sympathetic JS)

Below are some *minor* observations gathered during refactoring of our JS bootstrapping and modules. Some of which are consistent and others which need to be decided upon and then normalised  across the modules and we can create a document or github page by which we can reference for future development. 

Discussion on these conventions is encouraged ;)  and please feel free to add more to the list!

***

#### Module initialising
* If module requires multiple parameter/arguments to initialise, a single object with named keys is prefered e.g: 

```javascript
new AutoUpdate({
     path: window.location.pathname,
     delay: 10000,
     attachTo: qwery('.matches-container')[0],
     switches: switches
}).init();
```
over
```javascript
new AutoUpdate(window.location.pathname, 10000, qwery('.matches-container')[0], switches).init();
```
* All methods of a modules should be private unless methods that are required externally such as `init()`.
* Some modules return classes, some don't. A modules should only be called using the 'new' constructor if there needs to be multiple instances on the page such as tabs.

***

#### Naming conventions
* Method names should be camelCased with no hyphens or underscores.
* File names should be lowercase and hyphenated
* Shorter abbreviated names are preferred for common actions, such as `init` over `initialise`
* Show and Hide action names are preferred if manipulating the DOM such as: `showFrontFixtures()`;
* *Load* is preferred over *transclude* if module is handling ajax requests.
* Don't use underscores to denote variable/method privacy.

***

#### Events
This is a controversial one:
* EventEmitter pub/sub is expensive, and makes modules harder to read. Therefore, a module should only emit an event if it is required for cross app/module communication or testing, and not for internal communication.
* EventEmitter itself even warns if we go over a certain amount of events globally.

**Use an array for any parameters:**

```javascript
emit('modules:name:event', [param1, param_2]);
```

***

#### Defining requirements

Multi-line your define statement as it's easier to diff. Group by 3rd-party libs, lodash functions, common utils, common modules, bootstraps and finally plugin dependencies (each group alphabetised).
If the module is a 'class', i.e. user calls new, variable should be `PascalCase`, else if it's a function or object, `camelCase`

```javascript
define([
    'bonzo',
    'qwery',
    'lodash/collections/filter',
    'lodash/objects/assign',
    'common/utils/_',
    'common/utils/storage',
    'common/modules/analytics/mvt-cookie',
    'common/modules/experiments/tests/high-commercial-component',
    'bootstraps/article',
    'text!facia/views/button-show-more.html'
], function (
    bonzo,
    qwery,
    filter,
    assign,
    _,
    storage,
    mvtCookie,
    HighCommercialComponent,
    article,
    buttonShowMoreHtml
) {
```

***

#### Module patterns

> A modules should only be called using the 'new' constructor if there needs
> to be multiple instances on the page such as tabs.

How about just one module pattern.

Given the object-based one doesn't support multiple instances can we use this [below] for everything?

```javascript
function Foo(opts) {  // --- pass options in to constructor, not init()  

   // variable declaration etc.
   var options = opt,
        foo = options || false;

   // code to do with dom manipulation and user interaction goes in here
   this.view = {
      x: function() {  }
   } 
   
   // code to manipulate the data etc. 
   this.x = { };
   this.y = { };      

   // bindings
   common.mediator.on('module:xxx', this.view.x);

   // initialise
   this.init = function() { };

   return Foo;
}
```

***

#### Iteration

[Iterators](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/prototype#Methods) are easier to read than for loops, 

**Boo!**

```javascript
for (var i = 0, j = list.length; i<j; ++i) {
   document.cookie = list[i] + "=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}
```

**Yay!**

```javascript
list.forEach(function(item) { 
   document.cookie = item + "=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
});
```

**Boo!**

```javascript
var foo = [1,2,3], query = '';
for (var k = 0, l = foo.length; k<l; ++k) {
  query += "a=" + foo[k] + "&";
}
```

**Yay!**

```javascript
var query = [1,2,3].map(function(i){
 return "a=" + i;
}).join('&')
```

**Note:** to allow modules to be used for browsers that don't cut the mustard, it's safer to use [lodash's](lodash.com/docs) versions of these functions

***

#### Documentation

Using a docblock will get you shot, apparently, though it's quite useful when it comes to `_opts_`-style arguments:

```javascript
/*
 @param {Object} options hash of configuration options:
   prependTo   : {DOMElement}  DOM element to prepend component to
   competitions: {Array}       Ordered list of competetions to query
   path        : {String}      Used to overide endpoint path
   contextual  : {Boolean}     Whether or not component links should be contextual
   numVisible  : {Number}  Number of items to show when contracted
*/
```

***

#### Selecting DOM elements

It's easier to write tests for, and lets us scope the selector to a small part of the DOM, which is better for performance.

**Boo!**

```javascript
var f = function() {
   document.getElementById('foo');
}
```

**Yay!**

```javascript
var f = function(opts) {
   var doc = opts.document || window.document; 
   doc.getElementById('foo');
}
```

Though, of course, use [qwery](https://github.com/ded/qwery) for your element traversal, and [bonzo](https://github.com/ded/bonzo) for your manipulation

#### Variable declaration

**Boo!**
```javascript
var foo = 1,
    bar = 2;
```

**Hooray!**

```javascript
var foo = 1;
var bar = 2;
```

***

#### Jasmine specs

* Must have a corresponding test named after the module.

* Programatically create fixture HTML using the fixtures helper.

* Don't chain your tests. A new instance for each test of whatever you are testing is clearer.

* `waitsFor` is more obvious than `waits`.

* Keep everything inside `beforeEach` (otherwise you risk tests bleeding in to each other).

* Use Sinon spying over Jasmine (it's got a better feature-set).

* Clear the mediator listeners before all tests.

* Think about why you are using `waits(500)` - would the test be clearer if you linearised the logic?

* Reading globals - eg. `location`, `document` - via injection vs. common AMD module vs read directly?
