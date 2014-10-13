Jasq
====

[![Build Status](https://travis-ci.org/biril/jasq.png)](https://travis-ci.org/biril/jasq)
[![Bower version](https://badge.fury.io/bo/jasq.png)](http://badge.fury.io/bo/jasq)

[AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) dependency injector integrated with
[Jasmine](https://github.com/pivotal/jasmine).

Jasq simplifies testing AMD modules by overloading Jasmine's `describe` and `it` to

* maintain spec atomicity, avoiding persistent module state
* allow mocking of the tested module's dependencies, per suite or per spec

Jasq is built on the assumption that any Jasmine suite will concern (and thus, test / define the
specs for) nothing more than a single module. The Jasq version of `describe` allows specifying the
tested module (by name) and ensures that it is made available to all contained specs, defined with
`it`. These gain access to the tested module (through a `module` argument) and may easily provide
ad-hock mocks for any and all of its dependencies. The tested module is reloaded per spec and uses
any mocked dependencies defined. Mocks may also be defined at the suite level, to be reused for all
contained specs.

To implement dependency injection, Jasq wraps Jasmine's `describe` &amp; `it` global functions and
additionally provides overloaded versions which differ in the parameters they accept. These act as
extentions to Jasmine's built in functionality to be used as (and if) needed:

```javascript
// Invoke 'describe' - do not associate a module which the suite
describe("My suite", function () {
  // .. Jasmine specs ..
});

// Invoke 'describe' passing a moduleName argument to associate the suite
//  with the module. Contained specs gain access to the module
describe("My suite", "tested/module/name", function () {
  // .. specs ..
});

// Invoke 'describe' passing a suiteConfig hash as a second argument. Allows
//  specifying mocks through suiteConfig.mock
describe("My suite", {
  moduleName: "tested/module/name",
  mock: function () {
    // Return a hash of mocked dependencies
  },
  specify: function () {
    // .. specs ..
  }
});

// Invoke 'it'
it("should do something", function () {
  // .. expectations ..
});

// Invoke 'it' expecting a module. Specs defined within a suite associated
//  with a module will receive one. Additionally they will receive the
//  module's dependecies
it("should do something", function (module, dependencies) {
  // .. expectations ..
});

// Invoke 'it' passing a specConfig hash as a second argument. Allows
//  specifying mocks through specConfig.mock
it("should do something", {
  mock: {
    // Define mocked dependencies
  },
  expect: function (module, dependencies) {
    // .. expectations ..
  })
};
```

Jasq uses [RequireJS](https://github.com/jrburke/requirejs) for loading modules and is compatible
with [Jasmine, versions >= 2.0.0](https://github.com/pivotal/jasmine/releases). The current
revision is tested against Jamsine v2.0.2 and only in a browser environment - support for Node is
work in progress.

The following examples, while not a complete reference, should cover all essential use cases for
Jasq. Further insight may be gained by taking a look
[the included example](https://github.com/biril/jasq/tree/master/example),
[the project's test suite](https://github.com/biril/jasq/tree/master/test) and - of course -
[the source](https://github.com/biril/jasq/blob/master/jasq.js). For the latter, an
[annotated version](http://biril.github.io/jasq/) is also maintained.


Jasq by example
---------------

Consider modules `modA`, `modB` where the latter is a dependency of the former:

```javascript
// Defined in ModB.js:
define(function () {
  return {
    getValue: function () {
      return "B";
    }
  };
});

// Defined in modA.js:
define(["modB"], function (modB) {
  return {
    getValue: function () {
      return "A";
    },
    getValueAfterAWhile (cb) {
      setTimeout(function () {
        cb("A");
      }, 100)
    },
    getModBValue: function () {
      return modB.getValue();
    }
  };
});
```

A test suite for `modA` should be defined as a module hosting the relevant specs. It should require
Jasq (but not the tested `modA` itself):

```javascript
define(["jasq"], function () {
  // Implement modA test suite
});
```

Define the test suite by invoking `describe`, passing the module name as an additional parameter:

```javascript
require(["jasq"], function () {
  // The name of the tested module - 'modA' - is passed as a 2nd parameter
  //  to the describe call
  describe("The modA module", "modA", function () {
    // Implement modA specs
  });
});
```
This will make the module available to all specs within the suite as the expectation-function
passed to any nested `it` will now be invoked with `modA` as an argument:

```javascript
require(["jasq"], function () {
  describe("The modA module", "modA", function () {

    // The module is passed to specs within the suite, as a parameter
    it("should have a value of 'A'", function (modA) {
      expect(modA.getValue()).toBe("A"); // Passes
    });
  });
});
```

Note that the module will also be available to specs within _nested_ suites:

```javascript
require(["jasq"], function () {
  describe("The modA module", "modA", function () {

    describe("its value", function () {

      // The module is also passed to specs within the nested suite
      it("should be 'A'", function (modA) {
        expect(modA.getValue()).toBe("A"); // Passes
      });
    });
  });
});
```

Additionally, Jasq ensures that module state will not be persisted across specs:

```javascript
require(["jasq"], function () {
  describe("The modA module", "modA", function () {

    // This spec modifies modA
    it("should have a value of 'C' when tweaked", function (modA) {
      modA.getValue = function () {
        return "C";
      };
      expect(modA.getValue()).toBe("C"); // Passes
    });

    // This spec is passed the original, unmodified modA
    it("should have a value of A", function (modA) {
      expect(modA.getValue()).toBe("A"); // Passes
    });
  });
});
```

To mock `modA`'s dependencies, invoke `it` passing a `specConfig` hash as a second argument. Use
the `specConfig.mock` property to define a mapping of dependencies (module names) to mocks, as you
see fit. Pass the expectations function through the `specConfig.expect` property. In the following
example, `modB` is mapped to a `mockB` object:

```javascript
require(["jasq"], function () {
  describe("The modA module", "modA", function () {

    // Define a mock for modB
    var mockB = {
      getValue: function () {
        return "C";
      }
    };

    // modA will use the mocked version of modB
    it("should expose modB's value", {
      mock: {
        modB: mockB
      },
      expect: function (modA) {
        expect(modA.getModBValue()).toBe("C"); // Passes
      }
    });
  });
});
```

Specs additionally receive a `dependencies` argument which may be used to directly access any
mocked dependencies:

```javascript
require(["jasq"], function () {
  describe("The modA module", "modA", function () {

    // Mocked modB may be accessed through 'dependencies.modB'
    it("should expose modB's value", {
      mock: {
        modB: {} // Mocking with an empty object
      },
      expect: function (modA, dependencies) {
        dependencies.modB.getValue = function () {
          return "D";
        };
        expect(modA.getModBValue()).toBe("D"); // Passes
      }
    });
  });
});
```

Often, it may be useful to access a dependency without necessarily creating a mock beforehand. The
`dependencies` hash may be used to access any dependency, mocked or not:

```javascript
require(["jasq"], function () {
  describe("The modA module", "modA", function () {

    // modB may be accessed through 'dependencies.modB'
    it("should delegate to modB to expose modB's value", function (modA, dependencies) {
      spyOn(dependencies.modB, "getValue");
      modA.getModBValue();
      expect(dependencies.modB.getValue).toHaveBeenCalled(); // Passes
    });
  });
});
```

In cases where multiple specs make use of the very same mocks, you can avoid repeating their
definitions _per spec_ by providing a 'mocking function' at the suite level. The mocking function
should instantiate all needed mocks and return a hash that maps them to dependencies (module
names). This will make the mocks available to all specs defined within the suite. Note that the
mocking function will be invoked - and the mocks will be re-instatiated - _per spec_.

To do this, `describe` should be invoked with a `suiteConfig` hash as a second argument. Use the
`suiteConfig.mock` property to pass the mocking function. Assign the name of the tested module to
`suiteConfig.moduleName` and the specs function to `suiteConfig.specify`:

```javascript
require(["jasq"], function () {
  describe("The modA module", {
    moduleName: "modA",
    mock: function () {

      // Define a mock for modB
      return {
        modB: {
          getValue: function () {
            return "C";
          }
        }
      };
    },
    specify: function () {

      // modA will use the mocked version of modB
      it("should expose modB's value", function (modA) {
        expect(modA.getModBValue()).toBe("C"); // Passes
      });

      // This spec modifies the mocked modB
      it("should not cache modB's value", function (modA, dependencies) {
        dependencies.modB.getValue = function () {
          return "D";
        };
        expect(modA.getModBValue()).toBe("D"); // Passes
      });

      // modA will use the mocked version of modB, unmodified
      it("should expose modB's value - again", function (modA) {
        expect(modA.getModBValue()).toBe("C"); // Passes
      });
    }
  });
});
```

Note that mocks defined at the suite level will be overriden by those defined in specs:

```javascript
require(["jasq"], function () {
  describe("The modA module", {
    moduleName: "modA",
    mock: function () {

      // Define a mock for modB
      return {
        modB: {
          getValue: function () {
            return "C";
          }
        }
      };
    },
    specify: function () {

      // Redefine the modB mock - modA will use the redefined version
      it("should expose modB's value", {
        mock: {
          modB: {
            getValue: function () {
              return "D";
            }
          }
        },
        expect: function (modA) {
          expect(modA.getModBValue()).toBe("D"); // Passes
        }
      });
    }
  });
});
```

Asynchronous specs which are associated with a module, or are part of a suite associated with a
module, can access Jasmine's `done` function as the _third_ argument. For specs which aren't,
`done` can be accessed as the first (and only) argument:

```javascript
require(["jasq"], function () {

  // If spec is associated with a module access 'done' as the third argument
  describe("The modA module", "modA", function () {

    it("should have a value of A, after a while", function (modA, dependencies, done) {
      modA.getValueAfterAWhile(function (value) {
        expect(value).toBe("A"); // Passes
        done(); // Invoked to start the spec
      });
    });
  });

  // Otherwise access 'done' as the first (and only) argument
  describe("Something", function () {

    it("should happen after a while", function (done) {
      setTimeout(function () {
        done(); // Invoked to start the spec
      }, 100);
    });
  });
});
```


Set up
------

`bower install jasq` to obtain the latest Jasq plus dependencies. If you prefer to avoid bower,
just include [jasq.js](https://raw.github.com/biril/jasq/master/jasq.js) in your project along with
[RequireJS](https://github.com/jrburke/requirejs).

For a typical example of test-runner configuration please take a look a the included
[example test suite](https://github.com/biril/jasq/tree/master/example).


Testing / Contributing
----------------------

The QUnit test suite may be run in a browser (test/test.html) or on the command line, by
`npm test`. Note that the latter requires an installation of [phantomjs](http://phantomjs.org).

Contributions are obviously appreciated. Please commit your changes on the `dev` branch - not
`master`. `dev` is always ahead, contains the latest state of the project and is periodically
merged back to `master` with the appropriate version bump. In lieu of a formal styleguide, take
care to maintain the existing coding style. Please make sure your changes test out green prior to
pull requests.


License
-------

Licensed and freely distributed under the MIT License (LICENSE.txt).

Copyright (c) 2013-2014 Alex Lambiris
