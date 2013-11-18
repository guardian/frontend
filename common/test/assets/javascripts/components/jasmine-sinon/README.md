# Jasmine matchers for Sinon.JS

[![Build Status](https://travis-ci.org/froots/jasmine-sinon.png?branch=master)](https://travis-ci.org/froots/jasmine-sinon)

_jasmine-sinon_ provides a set of custom matchers for using the [Sinon.JS](http://sinonjs.org/) spying, stubbing and mocking library with [Jasmine BDD](http://pivotal.github.com/jasmine/).

Instead of:

    expect(mySinonSpy.calledWith('foo')).toBeTruthy();

you can say:

    expect(mySinonSpy).toHaveBeenCalledWith('foo');

This is not only nicerer to look at in your purdy specs, but you get more descriptive failure output in your Jasmine spec runner.

Instead of:

    Expected false to be truthy.

you get:

    Expected Function to have been called.

## Installation

### Direct include

Just include <code>lib/jasmine-sinon.js</code> in your Jasmine test runner file.
Don't forget to include [sinon.js](https://github.com/cjohansen/Sinon.JS).

### With [jasmine-gem](https://github.com/pivotal/jasmine-gem)

Add it to <code>jasmine.yml</code>. Don't forget to include [sinon.js](https://github.com/cjohansen/Sinon.JS).

### Node.js / NPM

`npm install jasmine-sinon --save-dev`

Then, in your jasmine spec:

```javascript
var sinon = require('sinon');
require('jasmine-sinon');
```

### Using Bower

`bower install jasmine-sinon --save-dev`

Then, include `components/jasmine-sinon/index.js` in your test runner.

## Sinon.JS matchers

In general, you should be able to translate a Sinon spy/stub/mock API method to a _jasmine-sinon_ matcher by prepending _toHaveBeen_ to the front of the method name. For example, the Sinon.JS spy method <code>called</code> becomes <code>toHaveBeenCalled</code>. There are one or two exceptions to this rule, so the full list of matchers is given below.

<table>
    <tr>
        <th>Sinon.JS property / method</th>
        <th>jasmine-sinon matcher</th>
    </tr>
    <tr>
        <td>called</td>
        <td>toHaveBeenCalled</td>
    </tr>
    <tr>
        <td>calledOnce</td>
        <td>toHaveBeenCalledOnce</td>
    </tr>
    <tr>
        <td>calledTwice</td>
        <td>toHaveBeenCalledTwice</td>
    </tr>
    <tr>
        <td>calledThrice</td>
        <td>toHaveBeenCalledThrice</td>
    </tr>
    <tr>
        <td>calledBefore()</td>
        <td>toHaveBeenCalledBefore()</td>
    </tr>
    <tr>
        <td>calledAfter()</td>
        <td>toHaveBeenCalledAfter()</td>
    </tr>
    <tr>
        <td>calledOn()</td>
        <td>toHaveBeenCalledOn()</td>
    </tr>
    <tr>
        <td>alwaysCalledOn()</td>
        <td>toHaveBeenAlwaysCalledOn()</td>
    </tr>
    <tr>
        <td>calledWith()</td>
        <td>toHaveBeenCalledWith()</td>
    </tr>
    <tr>
        <td>alwaysCalledWith()</td>
        <td>toHaveBeenAlwaysCalledWith()</td>
    </tr>
    <tr>
        <td>calledWithExactly()</td>
        <td>toHaveBeenCalledWithExactly()</td>
    </tr>
    <tr>
        <td>alwaysCalledWithExactly()</td>
        <td>toHaveBeenAlwaysCalledWithExactly()</td>
    </tr>
    <tr>
        <td>calledWithMatch()</td>
        <td>toHaveBeenCalledWithMatch()</td>
    </tr>
    <tr>
        <td>alwaysCalledWithMatch()</td>
        <td>toHaveBeenAlwaysCalledWithMatch()</td>
    </tr>
    <tr>
        <td>returned()</td>
        <td>toHaveReturned()</td>
    </tr>
    <tr>
        <td>alwaysReturned()</td>
        <td>toHaveAlwaysReturned()</td>
    </tr>
    <tr>
        <td>threw()</td>
        <td>toHaveThrown()</td>
    </tr>
    <tr>
        <td>alwaysThrew()</td>
        <td>toHaveAlwaysThrown()</td>
    </tr>
</table>

These matchers will work on spies, individual spy calls, stubs and mocks.

You can also use Jasmine spies alongside your Sinon spies. _jasmine-sinon_ will detect which you're using and use the appropriate matcher.

## Contributors

Thanks to:

* @aelesbao for Exception matchers
* @theinterned for, er, match matchers
* @milichev for graceful spy matchers
