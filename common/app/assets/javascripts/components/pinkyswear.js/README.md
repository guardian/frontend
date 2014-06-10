<a href="http://promisesaplus.com/">
    <img src="http://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo"
         title="Promises/A+ 1.1 compliant" align="right" />
</a>
PinkySwear.js 2.1
==================

PinkySwear is a very small implementation of the Promises/A+ specification. After compilation with the
Google Closure Compiler and gzipping it weighs less than 500 bytes. It is originally based on the implementation for 
<a href="http://minifiedjs.com">Minified.js</a> and is for embedding. In other words, you can use it as a
lightweight dependency for your library if you need to return a promise. It is not intended as a stand-alone
library for more complex applications, and therefore does not support assimilation of other promises.
Minified's implementation does support assimilation though.
 
## Release History ##

#####Version 2.1 released June 6, 2014
- Removed always() and error(), since they were not in the spirit of a minimal implementation.
- Updated Promises/A+ Compliance Test to 2.0.4

#####Version 2.0.2, released May 10, 2014
- Use setImmediate() on platforms that support it (thanks, Carl-Erik Kopseng)

#####Version 2.0.1, released Apr 3, 2014
- Fixed PinkySwear on IE8 which can't handle apply() without arguments (thanks, Luis Nabais)
- Fix and test case for PinkySwear's multi-arguments extension (thanks, Carl-Erik Kopseng)

#####Version 2.0, released Feb 10, 2014
Passes Promises/A+ Compliance Test 2.0.3. Allows obtaining state by calling promise function without arguments.

#####Version 1.0, released Feb 09, 2013
First release. Passes Promises/A+ Compliance Test 1.10.0 with one exception (PinkySwear is function-based, which is
allowed in the spec, but not in the old test suite).
 
 
## Stats ##

<table>
<tr><th>Name</th><th>Type</th><th>Size</th></tr>
<tr><td>pinkyswear.js</td><td>Source code</td><td>about 4kB</td></tr>
<tr><td>pinkyswear.min.js</td><td>Closure /w Advanced Optimization</td><td>828 bytes</td></tr>
<tr><td>pinkyswear.min.js.gz</td><td>Closure + GZip'd</td><td>460 bytes</td></tr>
</table>

## How to Include / Node.js ##

You can install PinkySwear.js using npm:
> npm install pinkyswear

Use require() to get the initial function:
> var pinkySwear = require('pinkyswear');


## How to Include / Browser ##

To use PinkySwear in a browser, just include it with a script tag. You probably want to use the minified version in a browser:
> &lt;script type="text/javascript" src="path/to/pinkyswear.min.js">&lt;/script>

 
## API ##
 
PinkySwear has just three functions.

To create a new promise in pending state, call pinkySwear():
>         var promise = pinkySwear();
 
The returned object has a Promises/A+ compatible then() implementation:
>         promise.then(function(value) { alert("Success!"); }, function(value) { alert("Failure!"); });
 
The promise returned by pinkySwear() itself is also a function. To fulfill the promise, call the function with true as first argument and
an optional array of values to pass to the then() handler. By putting more than one value in the array, you can pass more than one
value to the then() handlers. Here an example to fulfill a promise, this time with only one argument: 
>         promise(true, [42]);
 
When the promise has been rejected, call it with false as first argument:
>         promise(false, [6, 6, 6]);

You can obtain the promise's current state by calling the function without arguments. It will be true if fulfilled,
false if rejected, and otherwise undefined.
>		  var state = promise();
 

## Licensing ##

Public Domain. Use, modify and distribute it any way you like. No attribution required.
To the extent possible under law, Tim Jansen has waived all copyright and related or neighboring rights to PinkySwear.
Please see http://creativecommons.org/publicdomain/zero/1.0/
