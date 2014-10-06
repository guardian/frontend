# Squire.js

Squire.js is a dependency injector for Require.js users to make mocking dependencies easy!

![Squire.js - The Squire](http://f.cl.ly/items/2e3f3x3b0K132R3c2t06/squire.png)

## Installation


### Bower
```
bower install squire
```

### NPM
```
npm install squirejs
```

## API

### constructor

First you have to load Squire in, just like any other Require.js module. Beyond this example the rest of the documentation will assume you already loaded Squire   as a module dependency.

#### Default Configuration

```javascript
define(['Squire'], function(Squire) {
  var injector = new Squire();
});
```

#### Different Context

```javascript
var injector = new Squire('other-requirejs-context');
```

### require(Array dependencies, Function callback, Function errback)

```javascript
var injector = new Squire();
injector.require(['utilities/Calculator'], function(Calculator) {
  // Calculator has been loaded.
},
function(err) {
  // Calculator threw an error loading.
});
```

### mock(String name | Object(name: mock), Object mock)

The mock method lets you pass in mocks to be used for a given modules dependency. The first argument is the module name, the second argument is the mock itself. For multiple mocks you can pass an object, the objects key will be the path and the corresponding value will be used as the mock.

```javascript
var injector = new Squire();

// Key value mocking.
injector.mock(dependencyName, mockForDependency);

// You can pass an object literal as well.
injector.mock(dependencyNameAndMock);
```

```javascript
var injector = new Squire();
injector.mock('CrazyCalculatorDependency', {
    sin: 10
  })
  .require(['utilities/Calculator'], function(Calculator) {
    // The Calculators dependency 'CrazyCalculatorDependency' has been mocked to
    // use the object literal { sin: 10 } that we passed in.
  });
```

### store(String name | Array names)

The store method allows you to get a pointer back to a dependency so you can stub it.

```javascript
var injector = new Squire();
injector
  .store('CrazyCalculatorDependency')
  .require(['utilities/Calculator', 'mocks'], function(Calculator, mocks) {
    // mocks.store.CrazyCalculatorDependency is the Calculators dependency, you can
    // manipulate it or stub it with Sinon now.
  });
```

### clean(Optional (String name | Array names))

The clean method allows you to remove mocks by name from your Squire instance, or remove all mocks.

```javascript
var injector = new Squire();
injector.mock('something', { other: 'mock'});

// You do stuff but want to be able to get the real 'something' now.
injector.clean('something');

// Or a collection of mocks
injector.clean(['something', 'something/else']);
```

Or clean out all the mocks stored in a Squire instance.

```javascript
injector.clean();
```

### remove()

Remove all the dependencies loaded by this instance of Squire.

```javascript
injector.remove();
```

### run()

Run generates a function that will receive a done callback and execute it after your test function is complete. Particularly useful for frameworks where asynchrony is handled with a callback. Here is an example with Mocha.js. Jasmine can offer this callback approach using [Jasmin.Async](http://lostechies.com/derickbailey/2012/08/18/jasmine-async-making-asynchronous-testing-with-jasmine-suck-less/).

```javascript
it('should execute this test using run', injector.run(['mocks/Shirt'], function(Shirt) {
  Shirt.color.should.equal('Red');
}));
```

## Utilities

Squire.js offers a few helper functions to ease pains associated with mocking and testing AMD modules.

### Squire.Helpers.returns(Any what)

Create a mock that returns mockViewInstance

```javascript
injector.mock('Views/AwesomeView', Squire.Helpers.returns(mockViewInstance));
```

### Squire.Helpers.constructs(Any what)

Often times AMD modules return constructor functions which means that mocking such a class would end up having to create a function that returns a function that returns your mocked instance. Squire.js eases that pain by wrapping up your instance for you.

```javascript
injector.mock('Views/AwesomeView', Squire.Helpers.constructs(mockViewInstance));
```

Now any module that uses `Views/AwesomeView` as a constructor dependency will use get your mock instead:

```javascript
// when invoked with in an Squire.injector.require call
var awesome = new AwesomeView(); // awesome now gets your mockViewInstance
```
